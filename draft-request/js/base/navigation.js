(function() {	
	'use strict';

	Workle.namespace('draft.request.views');

	var draftRequest = Workle.draft.request;

	draftRequest.views['Navigation'] = Backbone.View.extend({
		el: '.j-draft_request__navigation_buttons',

		events: {
			'click .j-draft_request__navigation_button': '_onClickNavigationBtn',

			'click .j-draft_request__submit_button': '_onClickSubmit'
		},

		initialize: function() {
			this._unbindEvents();
		},

		render: function () {
			var btnText = (this.model.get('revision')) ? 'Отправить снова' : 'Отправить заявку';
			var step = this.model.stepsList[this.model.get('Values.ActiveStepIndex')],
				stepTpl = (step.number === 0) 
					? this._firstStepTpl : (step.number === this.model.lastIndex)
					? this._lastStepTpl.format(btnText)
					: this._stepTpl;

			this.$el.empty()
				.append(stepTpl);
		},

		_onClickSubmit: function (e) {
			var self = this;
			var btn = $(e.currentTarget);
			btn.addClass('wm-but-load');
			this.model.saveForm()
				.done(function () {
					self._initSubmit(btn);
				})
				.fail(function() {
					btn.removeClass('wm-but-load');
					self.model.trigger('submitFail');
			});
		},

		_initSubmit: function (btn) {
			this.model.submitForm(btn)
				.done(function() {
					location.href = Url.route('users.requests') + '?orderMode=DateCreated&orderDirection=Descending';
					btn.removeClass('wm-but-load');
				})
				.fail(function () {
					btn.removeClass('wm-but-load');
				});
		},

		_onClickNavigationBtn: function (e) {
			var direction = $(e.currentTarget).data('direction');
			var nextStep,
				nextStepAlias,
				currentStep = this.model.get('Values.ActiveStepIndex');

			nextStep = currentStep + direction;
			nextStep = (nextStep <= 0) ? 0 : nextStep;
			nextStepAlias = this.model.stepsList[nextStep].alias;
			draftRequest.router.navigate(nextStepAlias, {trigger: true});
		},

		_unbindEvents: function() {
			this.$el.off();
		},

		_firstStepTpl: '<span class="j-draft_request__navigation_button w-but wm-but-green wm-but-h30" data-direction="1">Далее &rarr;</span>',
		_lastStepTpl: '<span class="j-draft_request__navigation_button b-draft_request__button_back" data-direction="-1">&larr; <i>Назад</i></span><span class="j-draft_request__submit_button w-but wm-but-green wm-but-h30">{0}</span>',
		_stepTpl: '<span class="j-draft_request__navigation_button b-draft_request__button_back" data-direction="-1">&larr; <i>Назад</i></span><span class="j-draft_request__navigation_button w-but wm-but-green wm-but-h30" data-direction="1">Далее</span>'
	});
}());
