(function () {
	'use strict';

	Workle.namespace('draft.request');

	var draftRequest = Workle.draft.request;

	$(function () {
		Workle.require(
			'/resources/scripts/fileuploader.js',
			'/resources/scripts/jquery.dictionary.js',
			'/resources/scripts/ui/jquery.maskedinput.min.js',
			'/resources/framework/w-phone_input/js/wphoneInput.js',
			'/resources/libraries/underscore-min.js',
			'/resources/libraries/backbone/backbone-min.js',
			'/resources/features/clients/js/common/widgets/customers.api.js',
			'/resources/libraries/workle/forms.js',
			'/resources/libraries/backbone/plugins/deep-model.min.js',

			function () {
				var modelData = JSON.parse($('.j-model').html());
				draftRequest.model = new draftRequest.Model(modelData);
				draftRequest.form = new draftRequest.views.Form({
					model: draftRequest.model
				});
				draftRequest.router = new draftRequest.Router();
				Backbone.history.start();
			});
	});
})();
