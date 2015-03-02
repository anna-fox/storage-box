(function() {
	'use strict';

	Workle.namespace('draft.request.views');

	var draftRequest = Workle.draft.request;

	draftRequest.views['Tabs'] = Backbone.View.extend({
		el: '.j-request_tabs',

		initialize: function () {
			this.model.on('changeErrors', this.renderErrors, this);
		},

		render: function () {
			var stepAlias = this.model.stepsList[this.model.get('Values.ActiveStepIndex')].alias;

			var activeAnchor = this.$('a[href=#' + stepAlias + ']'),
				activeAnchorWrapper = activeAnchor.closest('li');

			activeAnchorWrapper
				.addClass('m-request_tabs__tab-active')
				.siblings().removeClass('m-request_tabs__tab-active');
		},

		renderErrors: function () {
			var tabsList = this.model.stepsList,
				wrongTabs = this.model.get('wrongTabs');
			if (wrongTabs) {
				_.each(tabsList, function(tab) {
					var $tab = this.$('a[href=#' + tab.alias + ']');

					if (!tab.validate) {
						$tab.removeClass('m-request_tabs__anchor-error')
							.removeClass('m-request_tabs__anchor-complete');
						return;
					}

					if (_.contains(wrongTabs, tab.alias)) {
						$tab.addClass('m-request_tabs__anchor-error')
							.removeClass('m-request_tabs__anchor-complete');
					} else {
						$tab.removeClass('m-request_tabs__anchor-error')
							.addClass('m-request_tabs__anchor-complete');
					}
                }.bind(this));
			} else if (this.model.get('complete')) {
				_.each(tabsList, function(tab) {
					var $tab = this.$('a[href=#' + tab.alias + ']');
					if (!tab.validate) {
						$tab.removeClass('m-request_tabs__anchor-error')
							.addClass('m-request_tabs__anchor-complete');
						return;
					}
				});
			}
		}
	});
}());