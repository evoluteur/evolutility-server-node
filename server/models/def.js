/*! ***************************************************************************
 *
 * evolutility-server :: def.js
 * Helpers for ui-models.
 *
 * https://github.com/evoluteur/evolutility-server
 * Copyright (c) 2016 Olivier Giulieri
 *************************************************************************** */

var _ = require('underscore');

module.exports = {

	getFields: function(uiModel, asObject) {
		var fs = asObject ? {} : [];

		function collectFields(te) {
			if (te && te.elements && te.elements.length > 0) {
				_.forEach(te.elements, function(te) {
					if (te.type != 'panel-list') {
						collectFields(te);
					}
				});
			} else {
				if (asObject) {
					fs[te] = te;
				} else {
					fs.push(te);
				}
			}
		}

		collectFields(uiModel);
		return fs;
	},

	getSubCollecs: function(uiModel) {
		var ls = {};

		function collectCollecs(te) {
			if (te.type === 'panel-list') {
				ls[te.attribute] = te;
			} else if (te.type !== 'panel' && te.elements && te.elements.length > 0) {
				_.each(te.elements, function(te) {
					if (te.type === 'panel-list') {
						ls[te.attribute] = te;
					} else if (te.type !== 'panel') {
						collectCollecs(te);
					}
				});
			} else {
				ls[te.attribute] = te;
			}
		}

		collectCollecs(uiModel);
		return ls;
	}

};
