(function() {
	'use strict';

	Workle.namespace('draft.request.views');

	var draftRequest = Workle.draft.request;

	draftRequest.views['SectionBase'] = Backbone.View.extend({
		tagName: 'div',

		className: 'j-main_section b-draft_form__section_wrapper',

		initialize: function (opts) {
			this.parentView = opts.parentView;
			this.$container = this.parentView.$stepMainSection;
		},

		basePath: '',

		render: function (stepAlias) {
            var templatePath = this.basePath + stepAlias;

			draftRequest.utils.getTemplate(templatePath, function (tpl) {
				var stepHtml = _.template(tpl, this.model.toJSON());
				this.parentView.$stepMainSection.html(stepHtml);
				this._initPluginsForInputs();
				_.defer(function () {
					this._bindEvents();
					if (this.model.validation) {
						this.model.validation.always(function () {
							this.renderErrors();
                        }.bind(this));
					}
					this.model.trigger('renderErrors');
					this.parentView.$('[data-toggle]:checked').trigger('change');
                }.bind(this));
			});
		},

		_initPluginsForInputs: function () {
			this._unbindPlugins();

			this.parentView.$('.j-mask_date').mask('99.99.9999');
			this.parentView.$('.j-mask_subdivision').mask('999-999');
			this.parentView.$('.j-mask_series').mask('9999');
			this.parentView.$('.j-mask_number').mask('999999');
			this.parentView.$('.j-mask_year').mask('9999');
			this.parentView.$('.j-mask_snils').mask('999-999-999 99');
			this.parentView.$('.j-mask_phone').mask('+7 (999) 999-99-99');
			this.parentView.$('.j-sel').selectBox();
			this.parentView.$('.j-custom-sel').selectBox();

			_.each(self.parentView.$stepMainSection.find('.j-phone'), function (elem) {
				var phoneNum = $(elem).data('val');
				phoneNum = (Workle.Phone.toUserFriendly(phoneNum)) ? phoneNum : '';
				$(elem).wphoneInput({ phone: phoneNum });
			});

			_.defer(function () {
				_.each(self.parentView.$stepMainSection.find('select.j-sel'), function (elem) {
					var elemName = $(elem).attr('name');
					var value = $(elem).siblings('.j-selected_value[data-name="' + elemName + '"]').val();
					$(elem).val(value)
						.selectBox('refresh');
				});

				_.each(self.parentView.$stepMainSection.find('.j-phone'), function (elem) {
					$(elem).find('.j-phone_input__phone')
						.attr('name', $(elem).data('name'));
					$(elem).find('.j-phone_input__code').removeClass('j-phone_input__code');
				});

				this.parentView.$('[data-toggle]:checked').trigger('change');
			});
		},

		_unbindPlugins: function () {
			this.parentView.$('.j-sel').selectBox('destroy');
			this.parentView.$('.j-custom-sel').selectBox('destroy');

			var masks = [
				'.j-mask_date',
				'.j-mask_subdivision',
				'.j-mask_series',
				'.j-mask_number',
				'.j-mask_year',
				'.j-mask_snils'
			];
			_.each(masks, function (mask) {
				this.parentView.$(mask).unmask();
            }.bind(this));
		},

		_bindEvents: function () {
			var self = this;

			this._unbindEvents();

			this.parentView.$el.on('change keyup', 'input, select, textarea', function (e) {
				_.debounce(this._onChangeValue($(e.currentTarget)), 5000);
            }.bind(this));
		},

		_unbindEvents: function() {
			this.parentView.$el.off('change keyup');
		},

		_onChangeValue: function (elem) {
			var elemParams = this._getElemParameters(elem);
			this.model.setComplexValue(elemParams);
			if (elemParams.toggle) {
				this._toggleConnectedFields(elemParams);
			}
			elem.removeClass('w-error');
			elem.siblings('.j-sel').removeClass('w-error');
			elem.siblings('label').removeClass('wm-but-red');
		},

		_getElemParameters: function (elem) {
			var elemValue,
				elemName = elem.attr('name'),
				elemType = elem.attr('type') || elem.data('type'),
				toggleElem = elem.data('toggle') || null;

			if (elemType === 'hidden' && elem.data('type') === 'upload') {
				elemType = 'upload';
			}

			switch (elemType) {
				case 'checkbox':
					elemValue = elem.is(':checked');
					break;
				case 'tel':
					var elemValArr = elem.val().match(/\d+/g);
					elemValue = (elemValArr === null) ? '' : (elemValArr).join('');
					break;
				case 'upload':
					elemValue = (elem.val() == '') ? elem.val() : JSON.parse(elem.val());
					break;
				default:
					elemValue = elem.val();
					break;
			}

			return {
				name: elemName,
				value: elemValue,
				toggle: toggleElem
			};
		},

		renderErrors: function () {
			var errors = this.model.get('errors');
			var currStep = this.model.stepsList[this.model.get('Values.ActiveStepIndex')];
			if (this.model.justLoaded || !currStep.validate) {
				return;
			}
			_.each(errors, function (item) {
				var $errorField = $(this.parentView.$el.find('[name ="' + item.Name + '"]'));
				if ($errorField.length === 0) {
					return;
				}

				var errorsText = item.Errors.join('<br />');
				var $errorRow = $errorField.parents('.j-draft_form__row');
				var errorBox = this._errorsTemplate.format(errorsText);
				$errorField.addClass('w-error');
				$errorRow
					.addClass('b-draft_form__row-error')
					.find('.j-error_content')
					.remove();
				$errorRow.append(errorBox);
				if ($errorField.is('.j-selected_value')) {
					$errorField.siblings('.j-sel').addClass('w-error');
				}

				if ($errorField.is('[type="radio"]')) {
					$errorField.next('label').addClass('wm-but-red');
				}

				if ($errorField.is('[data-type="upload"]')) {
					$errorField.siblings('.j-uploader')
						.addClass('m-draft_form__uploader-error');
				}
            }.bind(this));
		},

		_errorsTemplate: '<div class="w-tooltip__content b-draft_form__error_tooltip j-error_content">{0}</div>',

		_toggleConnectedFields: $.noop,

		_checkValidationState: $.noop,

		_initFileUploader: function (uploader, options) {
			var self = this;
			draftRequest.utils.createUploader(uploader, {
				onProgressCallback: options.onProgress || draftRequest.utils._onUploaderProgress,
				onErrorCallback: options.onError || draftRequest.utils._onUploaderError,
				onCompleteCallback: options.onComplete || draftRequest.utils._onUploaderComplete,
				context: self,
				isMultiple: $(uploader).data('multiple') || false
			});

			self.parentView.$el.on('click', '.j-remove_file', function (e) {
				draftRequest.utils._removeUploadedFile.call(self, $(e.currentTarget));
			});
		}
	});
})();