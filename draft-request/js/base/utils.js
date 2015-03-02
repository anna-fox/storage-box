(function () {
	'use strict';

	Workle.namespace('draft.request.utils');

	var draftRequest = Workle.draft.request;

	draftRequest.utils = {
		getTemplate: function (name, callback) {
			Workle.templates.TemplateManager.load('/resources/features/draft.request/tpl/' + name + '.html', callback);
		},

		formatDate: function (date) {
			if (!date) {
				return '';
			}

			var dateNum = (typeof date === 'number') ? date : +(date.match(/(\d+)/)[0]);
			var d = new Date(dateNum);
			var formattedDate = d.format('dd.mm.yyyy');

			return formattedDate;
		},

		createUploader: function (elem, parameters) {

			parameters = parameters || {};

			var uploader = new qq.FileUploader({
				element: elem,
				progressBarElement: $(elem).find('.j-progress_bar'),
				action: Url.route('file.upload.common'),
				forceMultipart: true,
				inputName: 'file',
				multiple: parameters.isMultiple || false,
				allowedExtensions: ['jpeg', 'jpg', 'gif', 'png', 'tif', 'pdf', 'zip', 'rar', '7z'],
				sizeLimit: 5242880,

				params: {
					type: 'ConsumerCredit',
					crop: false
				},

				onComplete: function (i, fileName, fileData) {
					parameters.onCompleteCallback.call(parameters.context, elem, fileData);
				},

				onError: function () {
					parameters.onErrorCallback.call(parameters.context, elem);
				},

				onProgress: function () {
					parameters.onErrorCallback.call(parameters.context, elem);
				},

				template: '<div class="qq-uploader">' +
					'<div class="qq-upload-drop-area"><span>{dragText}</span></div>' +
					'<div class="qq-upload-button btn b-draft_form__upload_btn"><span class="j-upload_file w-control">Прикрепить</span></div>' +
					'<ul class="qq-upload-list b-draft_form__upload_list j-upload_list"></ul>' +
					'</div>',

				fileTemplate: '<li class="b-draft_form__upload_result_item">' +
					'<span class="qq-upload-spinner"></span>' +
					'<span class="qq-upload-finished"></span>' +
					'<span class="qq-upload-file b-draft_form__uploaded_file"></span> ' +
					'<span class="qq-upload-size b-draft_form__file_size"></span> ' +
					'<span class="b-draft_form__remove_file j-remove_file"></span>' +
					'<a class="qq-upload-cancel " href="#">{cancelButtonText}</a>' +
					'<span class="qq-upload-failed-text b-file_upload__fail_text j-fail_text">{failUploadtext}</span>' +
					'<div class="progress progress-striped active j-progress"><div class="qq-progress-bar bar j-progress_bar"></div></div>' +
					'</li>'
			});
		},

		_removeUploadedFile: function ($elem) {
			var $uploadList = $elem.closest('.j-upload_list');
			var $uploader = ($uploadList.hasClass('qq-upload-list')) ? $uploadList.parents('.j-uploader') : $uploadList.siblings('.j-uploader');
			var $uploadResult = $uploader.siblings('.j-upload_result');

			$uploadList.empty();
			$uploadResult.val('')
				.trigger('change');
		},

		_onUploaderProgress: $.noop,

		_onUploaderComplete: function (elem, result) {
			$(elem).removeClass('m-draft_form__uploader-error')
				.find('.j-upload_list').show();

			var fileData = {};
			fileData[result.id] = {
				type: result.id,
				title: result.filename,
				path: result.virtualPath
			};

			$(elem).siblings('input[type="hidden"]')
				.val(JSON.stringify(fileData))
				.trigger('change');

			$(elem).siblings('.j-upload_list').remove();
		},

		_onUploaderError: $.noop,

		_mapFieldToError: $.noop,

		getFriendlyStepName: function (step) {
			switch (step) {
				case 'ClientData':
				case 'contacts':
					return '&laquoКонтакты&raquo';
				case 'DocumentData':
				case 'documents':
					return '&laquoДокументы&raquo';
				case 'JobData':
					return '&laquoРабота&raquo';
				case 'AdditionalData':
					return '&laquoДополнительно&raquo';
				case 'CreditData':
					return '&laquoДетали кредита&raquo';
				case 'ScanData':
				default:
					return '&laquoФинал&raquo';
			}
		}
	};
}());
