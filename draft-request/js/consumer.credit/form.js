(function () {

	'use strict';

	Workle.namespace('draft.request.views');

	var draftRequest = Workle.draft.request;

	draftRequest.views['Form'] = draftRequest.views.BaseForm.extend({
		initialize: function () {
			this.$tabs = this.$('.j-request_tabs');
			this.$navigation = this.$('.j-draft_request__navigation_buttons');
			this.$formStep = this.$('.j-draft_form__step');
			this.$stepMainSection = this.$('.j-main_section');
			this.$stepAdditionalSection = this.$('.j-additional_section');
			this.model.autosave.set(30000);
		},

		render: function (stepAlias) {
			this._renderStep(stepAlias);
			this._renderTabs(stepAlias);
			this._renderBottomNavigation();
		},

		_renderStep: function (stepAlias) {
			var specificSections = this.model._specificSections[stepAlias];

			if (!this.model.justLoaded) {
				this.model.saveForm();
			}

			if (this.model.previousStepIs('contacts')) {
				this.model.editCustomer();
			}

			this.clearSections();
			this._renderMainSection(stepAlias);
			this.$stepAdditionalSection
				.prepend('<h2 class="b-draft_request__subtitle">Для следующих банков требуется дополнительная информация</h2>');

			_.each(specificSections, function (templateData) {
				this._renderAdditionalSection(stepAlias, templateData);
            }.bind(this));
		},

		clearSections: function () {
			this.$stepMainSection.empty();
			this.$stepAdditionalSection.empty();
			this.$el.off();
			this.$('.j-draft_request__error_pane').remove();
		},

		_renderAdditionalSection: function (stepAlias, templateData) {
			var section = new draftRequest.views['specific']({
				model: this.model,
				parentView: this,
				stepAlias: stepAlias,
				templateName: templateData[0],
				productId: templateData[1]
			});
			section.render(stepAlias);
		},

		_renderErrorBanners: function (wrongSteps, hasSelectedBanks) {
			if (wrongSteps.length > 0) {
				var wrongStepsLength = wrongSteps.length;
				var stepsNames = _.map(wrongSteps, function (step) {
					return draftRequest.utils.getFriendlyStepName(step);
				});

				var last = stepsNames.pop();
				var stepsString = (stepsNames.length > 0) ? stepsNames.join(', ') + ' и ' + last : last;
				var sectionsText = 'Вы не можете скачать документы и отправить ' +
					wrongStepsLength.format('заявк{1}', 'у', 'и', 'и') +
					wrongStepsLength.format(', пока не буд{1}', 'ет', 'ут', 'ут') +
					wrongStepsLength.format(' заполнен{1} полностью', '', 'ы', 'ы') +
					wrongStepsLength.format(' раздел{1} ', '', 'ы', 'ы') + stepsString;

				var wrongStepsBlock = this._errorBannerTemplate.format(sectionsText);
				this.$stepMainSection.prepend(wrongStepsBlock);
			}

			if (!hasSelectedBanks) {
				var banksText = 'Вы не можете скачать документы и отправить заявку пока вы не выберете хотя бы 1 банк (нужно убрать галочку «Не отправлять» напротив хотя бы 1-го банка).';
				var bankBlock = this._errorBannerTemplate.format(banksText);
				this.$stepMainSection.prepend(bankBlock);
			}

			_.defer(function () {
				(wrongSteps.length > 0 || !hasSelectedBanks) ?
					this.$('.j-draft_request__submit_button').addClass('wm-but-dis') :
					this.$('.j-draft_request__submit_button').removeClass('wm-but-dis');
            }.bind(this));
		},

		_errorBannerTemplate: '<div class="b-draft_request__error_pane j-draft_request__error_pane">{0}</div>'

	});
})();