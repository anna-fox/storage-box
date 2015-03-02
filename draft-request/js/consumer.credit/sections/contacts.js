(function() {
	
	'use strict';

	Workle.namespace('draft.request.views');

	var draftRequest = Workle.draft.request;

	draftRequest.views['contacts'] = draftRequest.views.Section.extend({
		render : function() {
			var templatePath = 'consumer.credit/contacts';

			draftRequest.utils.getTemplate(templatePath, function(tpl) {
				var stepHtml = _.template(tpl, self.model.toJSON());
				this.parentView.$stepMainSection.html(stepHtml);
				this._initPluginsForInputs();
				this._bindSectionEvents();
				_.defer(function () {
					this._bindEvents();
					if (this.model.validation) {
						this.model.validation.always(function () {
							this.renderErrors();
						});
					}
                }.bind(this));
			});
		},

		_bindSectionEvents: function () {
			this._unbindSectionEvents();

			this.model.on('change:Values.ClientData.Id', function() {
				this._onSelectClient();
            }.bind(this));

			this.model.on('change:Values.ClientData.HasNoHomePhone', function () {
				var isChecked = this.model.get('Values.ClientData.HasNoHomePhone');
				this.parentView.$('[name="Values.ClientData.HomePhone"]').attr('disabled', isChecked);
            }.bind(this));

			this.parentView.$el.on('click', '.j-draft_form__create_client', function () {
				this.createClient();
            }.bind(this));

			this.model.on('change:Client', function () {
				this.render();
            }.bind(this));
		},

		_unbindSectionEvents: function () {
			this.parentView.$el.off('click', '.j-draft_form__create_client');
			this.model.off('change:Values.ClientData.Id');
			this.model.off('change:Client');
			this.model.off('change:Values.ClientData.HasNoHomePhone');
		},

		createClient: function () {
			var self = this;
			Workle.require([
				'/resources/features/clients/js/utils.js',
				'/resources/features/clients/js/common/editor.widgets.js',
				'/resources/features/clients/js/common/editor.js'
			], function () {
				Workle.clients.userApi = Workle.getUserData();
				Workle.clients.editor.showPopup({
					bindings: function (widget) {
						widget.on('edit.success', function (result) {
							var clients = self.model.get('Customers');
							clients.push(result);
							self.model.set('Customers', clients);
							self._refreshSelectedClient(result);
						});
					}
				});
			});
		},

		_onSelectClient: function () {
			var clientId = parseInt(this.model.get('Values.ClientData.Id'));
			var selectedClient = _.findWhere(this.model.get('Customers'), { 'Id': clientId });
			this._refreshSelectedClient(selectedClient);
		},

		_refreshSelectedClient: function (result) {
			var newClient = result || {};
			this.model.set('Values.ClientData.Id', newClient.Id || '');

			if (newClient.BirthDate) {
				var birthDate = draftRequest.utils.formatDate(newClient.BirthDate);
				this.model.set('Values.ClientData.BirthDate', birthDate);
			}

			if (!_.isEmpty(newClient.Contacts)) {
				var phone = _.findWhere(newClient.Contacts, { Type: 'phone' });
				var email = _.findWhere(newClient.Contacts, { Type: 'email' });
				if (phone) {
					this.model.set('Values.ClientData.Phone', phone.Value);
				}
				if (email) {
					this.model.set('Values.ClientData.Email', email.Value);
				}
			} else {
				this.model.set({
					'Values.ClientData.Email': '',
					'Values.ClientData.Phone': ''
				});
			}

			this.model.set({
				'Values.ClientData.Name': newClient.FirstName || '',
				'Values.ClientData.Patronymic': newClient.MiddleName || '',
				'Values.ClientData.Surname': newClient.LastName || ''
			});

			this.model.trigger('change:Client');
		}
	});

})();