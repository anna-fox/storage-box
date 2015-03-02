(function () {

	'use strict';

	Workle.namespace('draft.request.views');

	var draftRequest = Workle.draft.request;

	draftRequest.views['occupation'] = draftRequest.views.Section.extend({
		render: function (callback) {
			var templatePath = 'consumer.credit/occupation';

			draftRequest.utils.getTemplate(templatePath, function (tpl) {
				var stepHtml = _.template(tpl, this.model.toJSON());
				this.parentView.$stepMainSection.html(stepHtml);
				this._initPluginsForInputs();
				_.defer(function () {
					this._bindEvents();
					if (this.model.validation) {
						this.model.validation.always(function () {
							this.renderErrors();
						});
					}
                }.bind(this));
            }.bind(this));
		}
	});
})();
