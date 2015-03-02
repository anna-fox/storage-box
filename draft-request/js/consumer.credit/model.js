(function () {
	'use strict';

	Workle.namespace('draft.request');

	var draftRequest = Workle.draft.request;

	draftRequest['Model'] = draftRequest.BaseModel.extend({
		FIRST_STEP_ALIAS: 'credit-details',

		stepsList: [
			{
				name: 'CreditData',
				alias: 'credit-details',
				number: 0,
				validate: false
			},
			{
				name: 'ClientData',
				alias: 'contacts',
				number: 1,
				validate: false
			},
			{
				name: 'DocumentData',
				alias: 'documents',
				number: 2,
				validate: false
			},
			{
				name: 'JobData',
				alias: 'occupation',
				number: 3,
				validate: false
			},
			{
				name: 'AdditionalData',
				alias: 'additional',
				number: 4,
				validate: false
			},
			{
				name: 'ScanData',
				alias: 'final',
				number: 5,
				validate: false
			}
		],

		initialize: function (options) {
			this._formatModelData();
			this._stepsNameList = _.pluck(this.stepsList, 'name');
			this.stepsAliasList = _.pluck(this.stepsList, 'alias');
			this._specificSections = this._getSpecificSections();
			this._urlForSaving = Url.route('requests.drafts.edit', { id: this.get('Id'), productType: 'consumer-credit' });
			this._urlForSubmit = Url.route('requests.drafts.requests.create', { id: this.get('Id'), productType: 'consumer-credit' });
			this._urlForSendDocsByMail = Url.route('requests.drafts.documents.send', { id: this.get('Id'), productType: 'consumer-credit' });
			this._urlForDownloadAllDocs = Url.route('requests.drafts.documents.download', { id: this.get('Id') });

			this.lastIndex = _.size(this.stepsList) - 1;
		},

		_getSpecificSections: function () {
			var steps = {},
				self = this,
				productSpecificData = _.sortBy(self.get('Values.ProductSpecificData'), function (item) {
					return item.ProductId;
				});
			_.each(this._stepsNameList, function (item, i) {
				var step = steps[self.stepsAliasList[i]] = [];
				_.each(productSpecificData, function (bankInfo, b) {
					if (!_.isEmpty(bankInfo[item])) {
						var stepTemplateName = self._getTemplateName(bankInfo, item);
						step[b] = [stepTemplateName, bankInfo.ProductId];
					}
				});
			});
			return steps;
		},

		_getTemplateName: function (bankInfo, stepName) {
			if (stepName === 'CreditData') {
				return 'creditDataCommonTemplate';
			}

			var pathArr = (bankInfo.__type.split(',')[0]).split('.');
			var stepTemplateName = pathArr[pathArr.length - 1];

			if (stepName === 'ScanData') {
				if (bankInfo.ScanData.__type.indexOf('.ProductSpecificScanData') >= 0) {
					return 'scanDataCommonTemplate';
				}
			}

			var stepAlias = this.getAliasFromName(stepName);
			var sliceIndex = stepTemplateName.indexOf('ProductSpecificDraftRequestData');

			return stepTemplateName.slice(0, sliceIndex) + '/' + stepAlias;
		},

		_getAdditionalSectionData: function (productId) {
			var productIndex = null;
			_.each(this.get('Values.ProductSpecificData'), function (elem, i) {
				if (elem.ProductId === productId) {
					productIndex = i;
				}
			});

			return ($.extend({
				index: productIndex
			},
				_.findWhere(this.get('ProductDescriptions'), { Id: productId }),
				_.findWhere(this.get('Values.ProductSpecificData'), { ProductId: productId })
			));
		},

		_getBanksWithDocuments: function () {
			var banks = this._specificSections.final;
			var banksSpecificData = [];
			_.each(banks, function (bank) {
				var bankData = this._getAdditionalSectionData(bank[1]);
				if (!bankData.TurnedOff && !_.isEmpty(bankData.ScanData.Templates)) {
					banksSpecificData.push(bankData);
				}
			}, this);

			return banksSpecificData;
		},

		_collectValidationRulesForAllSections: function () {
			var rulesCollection = {};
			_.each(this._stepsNameList, function (stepName) {
				var stepRules = this._collectValidationRulesForSection(stepName);
				rulesCollection[stepName] = stepRules;
            }.bind(this));

			rulesCollection['ProductSpecificData'] = [];
			var productSpecificDataSize = _.size(this.get('Values.ProductSpecificData'));
			for (var i = 0; i < productSpecificDataSize; i++) {
				var specificStepRules = this._collectValidationRulesForSection('ProductSpecificData.' + i + '', 'ProductSpecificData[' + i + ']');
				rulesCollection['ProductSpecificData'].push(specificStepRules);
			}

			return _.flatten(rulesCollection);
		},

		_validateStep: function (stepIndex) {
			var stepName = this._stepsNameList[stepIndex];
			var stepData = this._prepareDataForValidation(stepName);
			var mainSectionErrors = this._validator.validate(stepData) || [];
			var additionalSectionsErrors = this._validateAdditionalSections(stepName) || [];
			this.errors[stepName] = mainSectionErrors.concat(additionalSectionsErrors);
		},
		
		_prepareDataForValidation: function (stepName, dictionaryPrefix) {
			dictionaryPrefix = dictionaryPrefix || stepName;
			var stepData = $.toDictionary(this.get('Values.' + stepName), 'Values.' + dictionaryPrefix, true);
			var stepDataObj = {};
			_.each(stepData, function (dataItem) {
				stepDataObj[dataItem.name] = dataItem.value;
			});
			return stepDataObj;
		},

		_validateAdditionalSections: function (stepName) {
			var specificDataSize = _.size(this.get('Values.ProductSpecificData'));
			var specificSectionsData = {};
			var stepAdditionalData = {};

			for (var i = 0; i < specificDataSize; i++) {
				specificSectionsData = _.extend(specificSectionsData, this._prepareDataForValidation('ProductSpecificData.' + i, 'ProductSpecificData[' + i + ']'));
			};

			_.each(specificSectionsData, function (sectionData, i) {
				if (i.indexOf(stepName) >= 0 || i.indexOf('TurnedOff') >= 0) {
					stepAdditionalData[i] = sectionData;
				}
			});

			return this._validator.validate(stepAdditionalData);
		},

		checkIfAnyBanksSelected: function () {
			var turnedOffValues = _.pluck(this.get('Values.ProductSpecificData'), 'TurnedOff');
			var hasSelectedBanks = _.indexOf(turnedOffValues, false) >= 0;

			return hasSelectedBanks;
		},
	});
})();
