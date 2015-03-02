(function () {
	'use strict';

	Workle.namespace('draft.request');

	var draftRequest = Workle.draft.request;

	draftRequest['BaseModel'] = Backbone.DeepModel.extend({
		FIRST_STEP_ALIAS: null,

		stepsList: null,

		initialize: function () {
			this._formatModelData();
			this.stepsAliasList = _.pluck(this.stepsList, 'alias');
			this._urlForSaving = Url.route('requests.drafts.edit', { id : this.get('Id'), productType : this.productType });
			this._urlForSubmit = Url.route('requests.drafts.requests.create', { id: this.get('Id'), productType: this.productType });
			this._urlForSendDocsByMail = Url.route('requests.drafts.documents.send', { id: this.get('Id'), productType: this.productType });
			this._urlForDownloadAllDocs = Url.route('requests.drafts.documents.download', { id : this.get('Id') });

			this.lastIndex = _.size(this.stepsList) - 1;
		},

		getCurrentStepAlias: function(query) {
			var activeStep = this.get('Values.ActiveStepIndex');
			if (_.contains(this.stepsAliasList, query)) {
				return query;
			} else if (activeStep >= 0) {
				var stepData = (_.findWhere(this.stepsList, { number : activeStep }));
				return stepData.alias;
			} else {
				return this.FIRST_STEP_ALIAS;
			}
		},

		setPreviousStepIndex: function () {
			var prevStep = this.get('Values.ActiveStepIndex');
			if (prevStep >= 0) {
				this.set('previousStep', prevStep);
				this.stepsList[prevStep].validate = true;
			}
		},

		setCurrentStepIndex: function (currentStepAlias, isFirstRender) {
			this.justLoaded = isFirstRender;
			var stepIndex = _.indexOf(this.stepsAliasList, currentStepAlias);
			this.set('Values.ActiveStepIndex', stepIndex);
		},

		setComplexValue: function (elemParams) {
			if (elemParams.name.indexOf('ProductSpecificData') < 0) {
				this.set(elemParams.name, elemParams.value);
			} else {
				var index = elemParams.name.match(/[(\d+)]/)[0];
				var specificFieldName = elemParams.name.match(/]\.(.+)/)[1];
				this.set('Values.ProductSpecificData.' + index + '.' + specificFieldName, elemParams.value);
			}
			this.trigger('change:Values');
			this._changedStamp = new Date().getTime();
		},

		getAliasFromName : function(stepName) {
			var requiredElement = _.findWhere(this.stepsList, { name : stepName });
			return requiredElement.alias;
		},

		_getTemplateName : $.noop,

		_formatModelData : function() {
			var dataPairs = $.toDictionary(this.get('Values'), 'Values', true),
				formattedDate = null,
				self = this;

			_.each(dataPairs, function(item) {
				if (item.value.toString().indexOf('/Date(') >= 0) {
					formattedDate = draftRequest.utils.formatDate(item.value);
					self.setComplexValue({
						name : item.name,
						value : formattedDate
					});
				} else if (item.name.toString().indexOf('NationalNumber') >= 0) {
					var name = item.name.slice(0, item.name.toString().lastIndexOf('.'));
					self.setComplexValue({
						name : name,
						value : item.value
					});
				}
			});
		},

		saveForm: function () {
			var self = this;
			var formValues = $.toDictionary(this.get('Values'), 'Values');
			var currStep = this.stepsList[this.get('Values.ActiveStepIndex')];
			if (currStep.number === this.lastIndex) {
				var activeStepItem = _.findWhere(formValues, { name: 'Values.ActiveStepIndex' });
				var activeStepIndex = _.indexOf(formValues, activeStepItem);
				formValues[activeStepIndex].value = this.lastIndex - 1;
			}

			return this.validation = $.ajax({
				url : this._urlForSaving,
				type : 'POST',
				data : formValues,
				error : function(data) {
					var errors = JSON.parse(data.responseText);
					self.set('complete', false);
					self._updateErrorsList(errors);
				},
				success : function() {
					self._updateErrorsList();
					self.set('complete', true);
				}
			});
		},
		
		submitForm: function () {
			var formValues = $.toDictionary(this.get('Values'), 'Values', true);
				return $.ajax({
					url : this._urlForSubmit,
					type : 'POST',
					data : formValues
				});
		},

		_updateErrorsList: function (data) {
			var filteredErrors = [];
			var wrongTabs = [];
			if (data) {
				filteredErrors = _.filter(data.Errors, function(error) {
					return _.size(error.Errors) > 0;
				});
				_.each(this.stepsList, function(step) {
					var hasErrors = _.some(filteredErrors, function(error) {
						return error.Name.indexOf(step.name) >= 0;
					});
					if (hasErrors) {
						wrongTabs.push(step.alias);
					}
				});
			} 
			this.set({
				errors: filteredErrors,
				wrongTabs: wrongTabs
			});

			this.trigger('changeErrors');
		},

		currentStepIs: function(alias) {
			return (this.stepsList[this.get('Values.ActiveStepIndex')].alias === alias);
		},

		previousStepIs: function (alias) {
			return ((this.get('previousStep') >= 0) && (this.stepsList[this.get('previousStep')].alias === alias));
		},

		isLastStep: function() {
			return (this.lastIndex === this.get('Values.ActiveStepIndex'));
		},

		isStepCompleted: function (stepIndex) {
			this._validateStep(stepIndex);
			return _.isEmpty(this.errors[this.stepsList[stepIndex].name]);
		},

		getIncompleteSteps: function () {
			var wrongSteps = [];
			var errors = this.errors;
			_.each(errors, function (error, name) {
				if (!_.isEmpty(error)) {
					wrongSteps.push(name);
				}
			});

			return wrongSteps;
		},

		editCustomer: function (callback) {
			var customers = this.get('Customers'),
				customerId = this.get('Values.ClientData.Id'),
				existingCustomer = _.findWhere(customers, { Id: parseInt(customerId) });
			var customerData = this.updateCurrentCustomer(customerId, existingCustomer);
			var onComplete = function (data) {
				if (typeof data === 'string' && data.length > 0) {
					customerId = parseInt(data, 10) || null;
				}
				this.updateCustomersList(data, customerData, customerId, existingCustomer);
				this.set('Values.ClientData.Id', customerId);
				Workle.functions.safe(callback)(data);
			}.bind(this);
			return Customers.edit(customerData.Id, customerData, onComplete, onComplete);
		},

		updateCurrentCustomer: function (customerId, existingCustomer) {
			var updatedCustomerData = (customerId && existingCustomer)
				? existingCustomer
				: {};
			var changedCustomer = this.get('Values.ClientData');

			updatedCustomerData['FirstName'] = changedCustomer.Name;
			updatedCustomerData['MiddleName'] = changedCustomer.Patronymic;
			updatedCustomerData['LastName'] = changedCustomer.Surname;
			updatedCustomerData['BirthDate'] = changedCustomer.BirthDate;

			if (updatedCustomerData.Contacts && !_.isEmpty(updatedCustomerData.Contacts)) {
				_.each(updatedCustomerData.Contacts, function (item) {
					if (item.Type === 'phone' && changedCustomer.Phone) {
						item.Value = changedCustomer.Phone;
					}
					if (item.Type === 'email' && changedCustomer.Email) {
						item.Value = changedCustomer.Email;
					}
				});
			} else {
				updatedCustomerData['Contacts'] = [];
				if (changedCustomer.Phone) {
					updatedCustomerData.Contacts.push({
						Type: 'phone',
						Value: changedCustomer.Phone
					});
				}
				if (changedCustomer.Email) {
					updatedCustomerData.Contacts.push({
						Type: 'email',
						Value: changedCustomer.Email
					});
				}
			}

			return updatedCustomerData;
		},

		updateCustomersList: function (requestData, customerData, customerId, existingCustomer) {
			var customers = this.get('Customers');
			if (customerId && existingCustomer) {
				_.each(customers, function(customer, i) {
					if (customer.Id === customerId) {
						customers[i] = customerData;
					};
				});
			} else {
				if (typeof requestData === 'string') {
					customerData.Id = parseInt(requestData);
				}
				customers.push(customerData);
			}
			this.set('Customers', customers);
		},

		autosave: (function () {
			var self = draftRequest;
			var DEFAULT_PERIOD = 30000;
			var lastChange = null;
			var formSave = null;

			var setAutosave = function (period, callback) {
				period = period || DEFAULT_PERIOD;
				if (self.model._intervalId) {
					self.model.autosave.clear();
				}

				self.model._intervalId = setInterval(function () {
					if (lastChange !== self.model._changedStamp) {
						formSave = self.model.saveForm();
					}
					lastChange = self.model._changedStamp;
					Workle.functions.safe(callback)(formSave);
				}, period);
			};

			var clearAutosave = function () {
				clearInterval(self.model._intervalId);
			};

			return {
				set : setAutosave,
				clear : clearAutosave
			};
		})()
	});
})();