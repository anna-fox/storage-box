(function() {
	'use strict';

	Workle.namespace('draft.request.utils');

	var draftRequest = Workle.draft.request;

	draftRequest.utils = _.extend(draftRequest.utils, {
		_mapFieldToError: function (field) {
			var nameArr = field.split('.');
			var patterns = [];
			var dependency = null;
			var fixedName = null;
			var fixedField = null;

			var lastItem = nameArr.pop();
			switch (lastItem) {
				// ignore list
				case '__type':
				case 'ShortAddress':
				case 'Credits':
				case 'LiabilitiesFromGuarantees':
				case 'LiabiliiesFromGuarantees':
				case 'Securities':
				case 'OverdraftLimits':
				case 'RegularMonthlyPayments':
				case 'Purpose':
				case 'Amount':
				case 'Term':
				case 'Currency':
				case 'ProductId':
				case 'TurnedOff':
				case 'Hidden':
				case 'ActiveStepIndex':
				case 'Zip':
				case 'RegistrationAddressPhone':
				case 'ClientData':
				case 'CreditData':
				case 'JobData':
				case 'DocumentData':
				case 'AdditionalData':
				case 'ScanData':
				case 'Letter':
				case 'Building':
				case 'Flat':
				case 'StockHolding':
				case 'CashOnAccounts':
				case 'TemporaryRegistrationStartDate':
				case 'TemporaryRegistrationEndDate':
				case 'PublicOfficialReason':
				case 'District':
				case 'PreviousOrganization':
				case 'PreviousOrganizationExperienceYearCount':
				case 'PreviousOrganizationExperienceMonthCount':
					return false;
					// rules for fields with dependencies
				case 'Phone':
					patterns.push('phone', 'required');
					break;
				case 'Email':
					patterns.push('email', 'required');
					break;
				case 'RelatedPersonPhone':
				case 'HomePhone':
					patterns.push('phone', 'required');
					dependency = function (obj) {
						var dependsOnField = 'Values.ClientData.HasNoHomePhone';
						return !(obj[dependsOnField] === true);
					};
					break;
				case 'Citizenship':
					patterns.push('required');
					dependency = function (obj) {
						var dependsOnField = 'Values.DocumentData.Passport.RussianCitizenship';
						return !(obj[dependsOnField] === 'true' || obj[dependsOnField] === true);
					};
					break;
				case 'PreviousSurname':
					patterns.push('required');
					dependency = function (obj) {
						var dependsOnField = 'Values.ClientData.ChangedSurname';
						return !(obj[dependsOnField] === 'false' || obj[dependsOnField] === false);
					};
					break;
				case 'Organization':
				case 'OrganizationalForm':
				case 'EmployeeCount':
				case 'ActivityKind':
				case 'MonthJobStarted':
				case 'YearJobStarted':
				case 'Position':
				case 'EmploymentStatus':
				case 'ExperienceMonthCount':
				case 'ExperienceYearCount':
				case 'WorkPhone':
				case 'OrganizationInn':
					patterns.push('required');
					dependency = function (obj) {
						var dependsOnField = 'Values.JobData.EmploymentType';
						return !(obj[dependsOnField] === 'не работаю');
					};
					break;
				case 'MilitaryBook':
					patterns.push('required');
					dependency = function (obj) {
						var dependsOnField = 'Values.ClientData.Gender';
						return !(obj[dependsOnField] === 'Female' || obj[dependsOnField] === 2);
					};
					break;
				case 'SpouseInitials':
				case 'SpousePreviousSurname':
				case 'SpouseBirthDate':
				case 'SpouseOrganization':
				case 'SpouseOrganizationOrganizationalForm':
				case 'SpousePosition':
				case 'SpouseWorkPhone':
					patterns.push('required');
					dependency = function (obj) {
						return !(obj['Values.' + nameArr[1] + '.AdditionalData.SpouseEmployed'] === 'true' || obj['Values.AdditionalData.MaritalStatus'] === 'холост (не замужем)' || obj['Values.' + nameArr[1] + '.TurnedOff'] === true);
					};
					break;
				case 'SpouseEmployed':
				case 'SpouseIsInMaternityLeave':
					patterns.push('required');
					dependency = function (obj) {
						return !(obj['Values.AdditionalData.MaritalStatus'] === 'холост (не замужем)' || obj['Values.' + nameArr[1] + '.TurnedOff'] === true);
					};
					break;
				case 'SurnameChangeYear':
				case 'SurnameChangePurpose':
				case 'PreviousName':
				case 'PreviousPatronymic':
					patterns.push('required');
					dependency = function (obj) {
						return !(obj['Values.ClientData.ChangedSurname'] !== 'true' || obj['Values.ClientData.ChangedSurname'] !== true || obj['Values.' + nameArr[1] + '.TurnedOff'] === true);
					};
					break;
					// rules for specific fields - default rules
				case 'type':
				case 'title':
				case 'path':
				case 'JobChangeCountInLast5Years':
				case 'RelatedPersonIsRelative':
				case 'ResidentialAddressLivingStartYear':
				case 'CapacityLimitedByCourt':
				case 'CreditTransactionsRightsRestricted':
				case 'Inn':
				case 'IsRussianPublicOfficial':
				case 'IsForeignPublicOfficial':
				case 'IsInternationalOrganizationPublicOfficial':
				case 'IsSpouseOfPublicOfficial':
				case 'OrganizationIsCommercial':
				case 'EmploymentRecordNumber':
				case 'EmploymentRecordIssueDate':
				case 'HasPetrokommertsAccountWithSavings':
				case 'HasPetrokommertsCardWithSavings':
				case 'PersonalDataProcessingConsentTemplate':
				case 'QuestionnaireTemplate':
				case 'CodeWord':
				case 'HasCriminalProsecution':
				case 'HasRequiredPaymentsSetByCourt':
				case 'CurrentlyInvolvedInLitigation':
				case 'HasUnsatisfiedJudgment':
				case 'PreviousPassportSeries':
				case 'PreviousPassportNumber':
				case 'OfficeId':
				case 'LastAddressResidenceDuration':
				case 'ResidenceCountry':
				case 'MilitaryServiceAttitude':
				case 'HasForeignPassport':
				case 'AdditionalDocumentType':
				case 'AdditionalDocumentNumber':
				case 'CriminalProsecution':
				case 'HasFiledLawsuits':
				case 'ResidenceChangeCountInLast10Years':
				case 'JobStartDate':
				case 'CurrentPositionStartDate':
				case 'TripsAvailability':
				case 'JobChangeCountInLastYear':
				case 'OrganizationOfficialSite':
				case 'OrganizationServingInNordea':
				case 'PreviousOrganizationPosition':
				case 'PreviousOrganizationHasSameJobProfileAsCurrentJob':
				case 'PreviousOrganizationEmploymentStatus':
				case 'PreviousOrganizationOrganizationalForm':
				case 'OrganizationAge':
				case 'SupervisorInitials':
				case 'Region':
				case 'City':
				case 'Street':
				case 'HouseNumber':
				case 'FamilyMembersMonthlyIncome':
				case 'HasBankAccount':
				case 'HasCard':
				case 'JobChangeCountInLast3Years':
				case 'Institution':
				case 'InstitutionCountry':
				case 'EducationEndYear':
				case 'EducationSpeciality':
				case 'AdditionalEducation':
				case 'IsPublicOfficial':
				case 'HasMarriageContract':
				case 'SolvencySecondDocument':
				case 'PensionInsurance':
				case 'ForeignPassport':
				case 'Questionnaire':
				case 'PersonalDataProcessingConsent':
					patterns.push('required');
					dependency = function (obj) {
						var dependsOnField = 'Values.' + nameArr[1] + '.TurnedOff';
						return !(obj[dependsOnField] === true);
					};
					break;
					// default rules for remaining fields
				default:
					patterns.push('required');
					break;
			}

			if (_.indexOf(nameArr, 'ResidentialAddress') >= 0) {
				dependency = function (obj) {
					var dependsOnField = 'Values.DocumentData.Equal';
					return !(obj[dependsOnField] === true);
				};
			};

			if (_.indexOf(nameArr, 'OrganizationAddress') >= 0) {
				dependency = function (obj) {
					var dependsOnField = 'Values.JobData.EmploymentType';
					return !(obj[dependsOnField] === true);
				};
			};

			if (fixedName) {
				return {
					patterns: patterns,
					dependence: dependency,
					name: lastItem,
					field: field,
					suppName: fixedName,
					suppField: fixedField
				};
			}

			return {
				patterns: patterns,
				dependence: dependency,
				name: lastItem,
				field: field
			};
		},

	});

})();