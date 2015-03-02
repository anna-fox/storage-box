(function() {

	'use strict';

	Workle.namespace('draft.request.views');

	var draftRequest = Workle.draft.request;

	draftRequest.views['specific'] = draftRequest.views.Section.extend({
		tagName : 'div',

		className : 'b-draft_form__section w-pane wm-pane-lblue',

		initialize : function(opts) {
			this.parentView = opts.parentView;
			this._stepAlias = opts.stepAlias;
			this._productId = opts.productId;
			this._templateName = opts.templateName;
		},

		render : function() {
			var self = this,
				templatePath = 'consumer.credit/specific/' + this._templateName;

			draftRequest.utils.getTemplate(templatePath, function(tpl) {

				var additionalSectionData = self.model._getAdditionalSectionData(self._productId);
				var stepHtml = self.$el.append(_.template(tpl, additionalSectionData));
				self.parentView.$stepAdditionalSection.append(stepHtml);
				if (additionalSectionData.CreditData && self._stepAlias === 'credit-details') {
					self._createOfficesList(additionalSectionData.Company.Id, additionalSectionData.CreditData.CityId);
				}

				self._initPluginsForInputs();
				self._bindEvents();
				if (self.model.validation) {
					self.model.validation.always(function () {
						self.renderErrors();
					});
				}
			});
		},

		_initPluginsForInputs : function() {
			var self = this;
			this.$('.j-mask_date').mask('99.99.9999');
			this.$('.j-mask_subdivision').mask('999-999');
			this.$('.j-mask_series').mask('9999');
			this.$('.j-mask_number').mask('999999');
			this.$('.j-mask_year').mask('9999');
			this.$('.j-sel').selectBox();

			_.each(this.$el.find('.j-phone'), function (elem) {
				$(elem).phoneInput({ phone : $(elem).data('val') });
			});

			_.defer(function () {

				// _initPhone
				_.each(self.$el.find('.j-phone'), function(elem) {
					$(elem).find('.j-phone_input__phone')
						.removeClass('wm-inpt-h22')
						.addClass('wm-inpt-h30')
						.attr('name', $(elem).data('name'));
					$(elem).find('.j-phone_input__code').removeClass('j-phone_input__code');
				});

				// _initSelect
				_.each(self.$el.find('select.j-sel'), function(elem) {
					var value = $(elem).siblings('.j-selected_value').val();
					$(elem).val(value)
						.selectBox('refresh');
				});

				// _initUploader
				_.each(self.$el.find('.j-uploader'), function(uploader) {
					self._initFileUploader(uploader, {
						context: self,
						onComplete: function (elem, result) {
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

							this.model.saveForm();
						}
					});
				});

				self.$('[data-toggle]:checked').trigger('change');
			});
		},

		_createOfficesList : function(companyId, cityId) {
			var self = this;
			var select = this.$('select.j-draft_form__input-office_id');
			var officeTemplate = '<option value="<%= id %>"><%= name %>, <%= address %></option>';

			var getOfficesRequest = function() {
				return $.get(Url.route('ajax', { action : 'offices' }) + '?cityId=' + cityId + '&company=' + companyId + '&productType=18&forRequest=true');
			};

			var renderOffices = function() {
				var officesArr = [];

				getOfficesRequest().done(function(offices) {
					_.each(offices, function(office) {
						officesArr.push(_.template(officeTemplate, office));
					});

					var value = select.siblings('.j-selected_value').val();
					select.append(officesArr.join(''))
						.val(value)
						.selectBox('refresh');
					self.model.setComplexValue({
						name : select.attr('name'),
						value : select.val()
					});
				});
			};

			renderOffices();
		}
	});

})();