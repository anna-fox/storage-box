(function() {

	'use strict';

	Workle.namespace('draft.request.views');

	var draftRequest = Workle.draft.request;

	draftRequest.views['BaseForm'] = Backbone.View.extend({
		el: '.j-draft_form',

		initialize: function () {
			this.$tabs = this.$('.j-request_tabs');
			this.$navigation = this.$('.j-draft_request__navigation_buttons');
			this.$formStep = this.$('.j-draft_form__step');
			this.$stepMainSection = this.$('.j-main_section');
			this.$errorNotes = this.$('.j-draft_request__error_notes');
			this.$requestBtb = this.$('.j-draft_request__create_request');
			this.model.autosave.set();
		},

		render: function (stepAlias) {
			this._renderStep(stepAlias);
			this._renderTabs();
			this._renderBottomNavigation();
			this._renderErrorNotes();
		},

		scrollToTabs: function () {
			$('html, body').animate({
				scrollTop: this.$el.offset().top
			}, 500);
		},

		_renderStep: function (stepAlias) {
			this.clearSections();
			this._renderMainSection(stepAlias);

			if (!this.model.justLoaded) {
				this.model.saveForm();
			}

			if (this.model.get('previousStep') === 0) {
				this.model.editCustomer();
			}

			this._bindFormEvents();
		},

		_bindFormEvents: function () {
			var self = this;
			this.model.on('changeStepAlias', function (alias) {
				self.scrollToTabs();
				self.render(alias);
			});

			this.model.on('submitFail', function () {
				var currentStepAlias = self.model.stepsList[self.model.get('Values.ActiveStepIndex')].alias;
				self.model.stepsList[self.model.get('Values.ActiveStepIndex')].validate = true;
				self.render(currentStepAlias);
			});
		},

		clearSections: function () {
			this.$stepMainSection.empty();
			this.$el.off();
			this.model.off();
		},
		
		_renderMainSection: function (stepAlias) {
			var self = this;
			var section = new draftRequest.views[stepAlias]({
				model: self.model,
				parentView: self
			});
			section.render(stepAlias);
		},

		_renderTabs: function () {
			var self = this;
			var tabs = new draftRequest.views.Tabs({
				model : self.model
			});
			tabs.render();
		},

		_renderBottomNavigation: function () {
			var self = this;
			var buttons = new draftRequest.views.Navigation({
				model: self.model
			});

			buttons.render();
		},

		_renderErrorNotes: function () {
			this.$errorNotes.empty();
			var wrongSteps = this.model.get('wrongTabs'),
				hasWrongSteps = wrongSteps && wrongSteps.length > 0,
				isValidationNeeded = this.model.stepsList[this.model.get('Values.ActiveStepIndex')].validate;

			if (this.model.isLastStep() && hasWrongSteps && isValidationNeeded) {
				var stepsNames = _.map(wrongSteps, function (step) {
					return draftRequest.utils.getFriendlyStepName(step);
				});
				var last = stepsNames.pop();
				var stepsLength = wrongSteps.length;
				var stepsString = (stepsLength > 1) ? stepsNames.join(', ') + ' и ' + last : last;
				var sectionsText = 'Чтобы отправить заявку, полностью заполните' +
					stepsLength.format(' раздел{1} ', '', 'ы', 'ы') + stepsString;

				var wrongStepsBlock = this._errorBannerTemplate.format(sectionsText);
				this.$errorNotes.append(wrongStepsBlock);
			}
		},

		_errorBannerTemplate: '<div class="b-draft_request__error_pane j-draft_request__error_pane">{0}</div>'
	});
})();