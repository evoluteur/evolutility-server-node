/*! *******************************************************
 *
 * evolutility-server-node :: utils/sql-select.js
 *
 * https://github.com/evoluteur/evolutility-server-node
 * (c) 2018 Olivier Giulieri
 ********************************************************* */

const dico = require('./dico')
const ft = dico.fieldTypes
	
// - SQL for a single field/column in update/create/order
var columnName = {
	'update': (f, idx) => '"'+f.column+'"=$'+idx,

	'insert': (f) => f.column,

	'order': (f) => {
		// - generate sql ORDER BY clause (for 1 field)
		if(f){
			if(f.type==='lov' && f.lovtable){
				return '"'+f.id+'_txt"';
			}else{
				var col = 't1."'+f.column+'"';
				if(f.type===ft.bool){
					return 'CASE WHEN '+col+'=TRUE THEN TRUE ELSE FALSE END'
				}else if(f.type==='text'){
					// TODO: better way?
					return 'LOWER('+col+')'
				}
				return col;
			}
		}
	}
}

module.exports = {

	columnName: columnName,
	
	// - returns the SELECT clause for SQL queries
	select: function(fields, collecs, table, action){
		var sqlfs = [],
			tQuote = table ? 't1."' : '"';

		if(fields){
			fields.forEach(function(f, idx){
				if(f.type==='lov' && action!=='C' && action!=='U'){
					sqlfs.push(f.t2+'.'+(f.lovcolumn ? f.lovcolumn : 'name')+' AS "'+f.id+'_txt"')
					if(f.lovicon){
						sqlfs.push(f.t2+'.icon AS "'+f.id+'_icon"')
					}
				}
				let sql = tQuote+f.column
				//if(f.type==='money'){
					//sql += '"::money'
				//}else if(f.type==='integer'){
					//sql += '"::integer'
				//}else if(f.type==='decimal'){
					//sql += '"::float'
				//}else{
					sql += '"'
				//}
				if(f.column && f.id!=f.column){
					sql += ' AS "'+f.id+'"'
				}
				sqlfs.push(sql);
			});
		}
		/*
		if(collecs){
			sqlfs=sqlfs.concat(collecs.map(function(c){
				return tQuote+(c.column||c.id)+'"';
			}));
		}*/
		return sqlfs.join(',');
	},

	// - returns lists of names, values, invalids (for Insert or Update) 
	namedValues: function(m, req, action){
		var fnName = columnName[action],
			ns = [],
			vs = [],
			invalids = [];

		function addInvalid(fid, value, condition){
			//invalids.push(fid)
			invalids.push({
				id: fid,
				value: value,
				condition: condition,
			})
		}

		m.fields.forEach(function(f){
			if(f.column!='id' && f.type!='formula' && !f.readOnly){
				var fv=req.body[f.id];
				if(fv!==null && fv!==undefined){
					switch(f.type){
						case 'panel-list':
							vs.push(JSON.stringify(fv));
							ns.push(fnName(f, vs.length));
							break;
						case 'boolean':
							if(f.required && fv==='false'){
								addInvalid(f.id, fv, 'required')
							}
							vs.push((fv&&fv!=='false')?'TRUE':'FALSE');
							ns.push(fnName(f, vs.length));
							break;
						case 'date':
						case 'time':
						case 'datetime':
						case 'lov':
							vs.push((!fv)?null:fv);
							ns.push(fnName(f, vs.length));
							break;
						default:
							if(dico.fieldIsNumber(f)){
								if(f.min && fv<f.min){
									addInvalid(f.id, fv, 'min = '+f.min)
								}
								if(f.max && fv>f.max){
									addInvalid(f.id, fv, 'max = '+f.max)
								}
							}
							if(f.maxLength && fv.length>f.maxLength){
								addInvalid(f.id, fv, 'maxLength = '+f.maxLength)
							}
							if(f.minLength && fv.length<f.minLength){
								addInvalid(f.id, fv, 'minLength = '+f.minLength)
							}
							vs.push(fv);
							ns.push(fnName(f, vs.length));
					}
				}else if(f.required){
					addInvalid(f.id, fv, 'required')
				}
			}
		});
		if(m.collections){
			m.collections.forEach(function(f){
				var fv=req.body[f.id];
				if(fv!=null){
					vs.push(JSON.stringify(fv));
					ns.push(fnName(f, vs.length));
				}
			});
		}
		return {
			names: ns,
			values: vs,
			invalids: invalids.length>0 ? invalids : null
		};
	},

	// - returns sql (obj) ORDER BY clause for many fields
	sqlOrderFields: function(m, fullOrder){
		const qos = fullOrder.split(',');

		return qos.map(function(qo){
			var ows = qo.split('.'),
				f = m.fieldsH[ows[0]],
				col = f ? columnName.order(f) : 'id' // -- sort by id if invalid param
			
			if(ows.length===1){
				return col;
			}else{
				return col + (ows[1]==='desc'?' DESC':' ASC');
			}
		}).join(',')
	},

	// - returns SQL list of joined tables for lov fields
	sqlFromLOVs: function(fields, schema){
		let sql = '';

		fields.forEach(function(f, idx){
			if(f.type==='lov' && f.lovtable){
				sql += ' LEFT JOIN '+schema+'."'+f.lovtable+'" AS '+f.t2+
					' ON t1."'+f.column+'"='+f.t2+'.id';
			}
		})
		return sql;
	}

}
