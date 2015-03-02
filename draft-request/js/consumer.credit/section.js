(function () {
	'use strict';

	Workle.namespace('draft.request.views');

	var draftRequest = Workle.draft.request;

	draftRequest.views['Section'] = draftRequest.views.SectionBase.extend({

		basePath:'consumer.credit/',

		_toggleConnectedFields: function (elemParams) {
			var targetElem = this.parentView.$('[data-target*="' + elemParams.toggle + '"]');
			switch (elemParams.toggle) {
				case 'citizenship':
					targetElem.toggle(elemParams.value !== 'true');
					break;
				case 'previous_surname':
					targetElem.toggle(elemParams.value === 'true');
					break;
				case 'spouse':
					targetElem.toggle(elemParams.value !== 'холост (не замужем)');
					break;
				case 'spouse_job':
					targetElem.toggle(elemParams.value === 'true');
					break;
				case 'relatives_contacts':
					targetElem.toggle(elemParams.value !== true);
					break;
				case 'employment_type':
					targetElem.toggle(elemParams.value === 'не работаю');
					break;
				default:
					targetElem.toggle(elemParams.value !== true);
					break;
			}
		}
	});
})();