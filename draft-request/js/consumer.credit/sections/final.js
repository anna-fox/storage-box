(function () {

	'use strict';

	Workle.namespace('draft.request.views');

	var draftRequest = Workle.draft.request;

	draftRequest.views['final'] = draftRequest.views.Section.extend({
		render: function () {
			var templatePath = 'consumer.credit/final',
                self = this;

			var banksWithDocuments = this.model._getBanksWithDocuments();

			this.model.set('banksWithDocuments', banksWithDocuments);

			draftRequest.utils.getTemplate(templatePath, function (tpl) {
				var stepHtml = _.template(tpl, this.model.toJSON());
				this.parentView.$stepMainSection.html(stepHtml);
				this._initPluginsForInputs();
				this._bindSectionEvents();

				_.each(this.parentView.$stepMainSection.find('.j-uploader'), function (uploader) {
					this._initFileUploader(uploader, {
						context: self,
						onComplete: function(elem, result) {
							$(elem).removeClass('m-draft_form__uploader-error')
								.find('.j-upload_list').show();

							var fileData = {};
							fileData[result.id] = {
								type : result.id,
								title : result.filename,
								path : result.virtualPath
							};

							$(elem).siblings('input[type="hidden"]')
								.val(JSON.stringify(fileData))
								.trigger('change');

							$(elem).siblings('.j-upload_list').remove();

							this.model.saveForm();
						}
					});
				});

				_.defer(function () {
					this._bindEvents();
					if (this.model.validation) {
						this.model.validation.always(function () {
							this.renderErrors();
                        }.bind(this));
					}
                }.bind(this));
            }.bind(this));
		},

		_bindSectionEvents: function () {
			this.parentView.$el.on('click', '.j-draft_form__generate_document', function (e) {
				if ($(e.currentTarget).hasClass('wm-but-dis')) {
					return;
				}
				this._generateFilledDocument($(e.currentTarget), true);
            }.bind(this));

			this.parentView.$el.on('click', '.j-draft_form__send_documents', function (e) {
				if ($(e.currentTarget).hasClass('wm-but-dis')) {
					return;
				}
				this._sendDocumentsByMail();
            }.bind(this));

			this.parentView.$el.on('click', '.j-draft_form__download_documents', function (e) {
				if ($(e.currentTarget).data('disabled') === true) {
					return;
				}
				this._downloadAllDocuments();
            }.bind(this));
		},

		_changeDocumentLink: function (data, elem) {
			elem.siblings('.j-draft_form__document_pattern')
				.val(data.VirtualPath)
				.trigger('change');
		},

		_generateFilledDocument: function (elem, open, callback) {
			var self = this;
			var params = {
				productType: 'consumer-credit',
				id: self.model.get('Id'),
				productId: elem.data('id'),
				type: elem.data('type')
			};

			$.get(Url.route('requests.drafts.documents', params))
				.done(function (result) {
					self._changeDocumentLink(result, elem);
					if (open) {
						window.open(result.VirtualPath);
					}
					if (typeof callback === 'function') {
						callback();
					}
				});
		},

		_sendDocumentsByMail: function () {
			var executeSend = function () {
				$.post(this.model._urlForSendDocsByMail)
					.done(function () {
						alert('Документы успешно отправлены');
					});

            };

			this._generateAllDocuments(executeSend);
		},

		_formatScanDataValues: function () {


			return values;
		},

		_downloadAllDocuments: function () {
			var executeDownload = function () {
				window.open(this.model._urlForDownloadAllDocs);
            }.bind(this);

			this._generateAllDocuments(executeDownload);
		},

		_generateAllDocuments: function (callback) {
			var length = self.parentView.$('.j-draft_form__generate_document').length;
			var generateCount = 0;
			var generateDone = function () {
				generateCount++;
				if (generateCount === length) {
					if (typeof callback === 'function') {
						this.model.saveForm(callback);
					}
				}
            }.bind(this);

			_.each(this.parentView.$('.j-draft_form__generate_document'), function (item) {
				this._generateFilledDocument($(item), false, generateDone);
            }.bind(this));
		}
	});
})();
