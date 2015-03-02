(function() {
	'use strict';

	Workle.namespace('draft.request.Router');

	var draftRequest = Workle.draft.request;

	draftRequest.Router = Backbone.Router.extend({
		initialize: function () {
			this.route(/^(.*)$/, '_renderForm');
		},

		_renderForm: function (query) {
			var isFirstRender = !query;
			var currentStep = draftRequest.model.getCurrentStepAlias(query);
			draftRequest.model.setPreviousStepIndex();
			draftRequest.model.setCurrentStepIndex(currentStep, isFirstRender);
			draftRequest.form.render(currentStep);
		}
	});
}());