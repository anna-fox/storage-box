(function () {

	'use strict';

	Workle.namespace('draft.request.views');

	var draftRequest = Workle.draft.request;

	draftRequest.views['additional'] = draftRequest.views.Section.extend({
		render: function () {
			var templatePath = 'consumer.credit/additional';

			draftRequest.utils.getTemplate(templatePath, function (tpl) {
				var stepHtml = _.template(tpl, self.model.toJSON());
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
			});
		}
	});
})();
