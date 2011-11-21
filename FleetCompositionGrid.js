FleetCompositionGrid = Ext.extend(Ext.grid.EditorGridPanel, {
	summaryStore: '',
	fleetCompositionStore: '',
	gridLoaded: false,
	fleetId: '',
	isFleetCommander: false,
	isXO: false,
	inFleet: false,
	transferOwnershipButton: '',
	makeXOButton: '',
	autoAssignTrackGroups: '',
	autoAssignDampGroups: '',
	motherPanel: '',
		
	initComponent:function() {
		var eto = this;

        var reader = new Ext.data.JsonReader({
	        fields: [ 
		        {name: 'id', type: 'int', mapping: 'id'},
		        {name: 'pilot', type: 'string', mapping: 'pilot'},
		        {name: 'shipName', type: 'string', mapping: 'shipName'},
		        {name: 'shipDNA', type: 'string',mapping: 'shipDNA'},
		        {name: 'scrams', type: 'int', mapping: 'scrams'},
		        {name: 'points', type: 'int', mapping: 'points'},
		        {name: 'webs', type: 'int', mapping: 'webs'},
		        {name: 'caldECM', type: 'int', mapping: 'caldECM'},
		        {name: 'minmECM', type: 'int', mapping: 'minmECM'},
		        {name: 'amarECM', type: 'int', mapping: 'amarECM'},
		        {name: 'galeECM', type: 'int', mapping: 'galeECM'},
		        {name: 'multECM', type: 'int', mapping: 'multECM'},
		        {name: 'damps', type: 'int', mapping: 'damps'},
		        {name: 'paints', type: 'int', mapping: 'paints'},
		        {name: 'tracks', type: 'int', mapping: 'tracks'},
		        {name: 'neuts', type: 'int', mapping: 'neuts'},
		        {name: 'rshield', type: 'int', mapping: 'rshield'},
		        {name: 'rcap', type: 'int', mapping: 'rcap'},
		        {name: 'rarmor', type: 'int', mapping: 'rarmor'},
		        {name: 'rhull', type: 'int', mapping: 'rhull'},
		        {name: 'scanner', type: 'int', mapping: 'scanner'},
		        {name: 'dps', type: 'int', mapping: 'dps'},
		        {name: 'isFC', type: 'boolean', mapping: 'isFC'},
		        {name: 'isXO', type: 'boolean', mapping: 'isXO'},
		        {name: 'trackGroup', type: 'int', mapping: 'trackGroup'},
		        {name: 'dampGroup', type: 'int', mapping: 'dampGroup'},
	      	]
	    });
	    
	    //var summary = new Ext.grid.GroupSummary();
	    this.fleetCompositionStore = new Ext.data.Store({
            reader: reader,
            data: [{}],
            sortInfo: {
				field: 'shipName',
				direction: 'ASC' // or 'DESC' (case sensitive for local sorting)
			},
        });
        
	    this.fleetCompositionStore.on('add', function(records, index) {
		    // we need to figure out if the pilot is already in the fleet
		    eto.inFleet = false;
		    eto.isXO = false;
		    eto.isFleetCommander = false;
		    var mainRec = eto.summaryStore.getAt(0);
		    var fcName = mainRec.get('fleetOwner');
		    var xoName = mainRec.get('fleetXO');
		    if(pilotName == fcName) {
			    eto.isFleetCommander = true;
		    }
		    if(pilotName == xoName) {
			    eto.isXO = true;
		    }
		    for(var c = 0; c < records.getCount(); c++) {
			    var record = records.getAt(c);
			    var thisPilot = record.get('pilot');
			    if(pilotName == thisPilot) {
				    eto.inFleet = true;
			    }
			    if(thisPilot == fcName) {
				    record.data["isFC"] = true;
			    }
			    if(thisPilot == xoName) {
				    record.data["isXO"] = true;
			    }			    
		    }
		    var setGridEditable = false;
		    if(eto.isFleetCommander || eto.isXO) {
			    setGridEditable = true;
			    eto.autoAssignTrackGroups.enable();
			    eto.autoAssignDampGroups.enable();
		    }
		    var cm = eto.getColumnModel();
		    cm.setEditable(cm.getIndexById('trackColumn'), setGridEditable);
		    cm.setEditable(cm.getIndexById('dampColumn'), setGridEditable);
		    eto.pilotInFleet(eto.inFleet);
	    });
	    
	    this.on('afterrender', function() {
		    eto.getStore().removeAll();
		    if(eto.summaryStore) {
				eto.loadRecord(eto);
			}
			eto.gridLoaded = true;
	    });
		
	    var sm2 = new Ext.grid.RowSelectionModel({singleSelect:true});
	    
	    var compRefreshHandler = function(button, event) {
	    	if(event) {
		    	eto.reloadStore(eto);
	    	}
		};
		
		var backToFleetListHandler = function(button, event) {
	    	if(event) {
		    	FleetManagement.showFleets();
	    	}
		};
		
		var joinFleetHandler = function(button, event) {
	    	if(event) {
		    	Ext.Msg.prompt('Enter Ship Fitting URL', instructionPrompt, function(btn, text){
				    if (btn == 'ok'){
						var conn = new Ext.data.Connection();
						conn.request({
						    url: 'fleetFittings.php',
						    method: 'POST',
						    params: {"task": "JOIN", "fleetId": eto.fleetId, "pilot": pilotName, "shipDNA": text},
						    failure: function(response, opts) {
						        Ext.Msg.alert('Error', 'Server Error: Failed Request. Try again or contact an administrator');
						    },
						    success: function(response, opts) {
							    if(response.responseText == "0") {
								    Ext.Msg.alert('Error', 'Cannot join this fleet.');
							    }
							    eto.reloadStore(eto);
						    }
						});			
				    }
				});
	    	}
		};
		
		var leaveFleetHandler = function(button, event) {
	    	if(event) {
		    	Ext.Msg.confirm('Leave Fleet?', 'Are you sure you want to leave the fleet?', function(btn){
				    if (btn == 'yes'){
						if(eto.isFleetCommander) {
					    	Ext.Msg.alert('Cannot do', 'Sorry, mate, but you are a fleet commander. You can disband the fleet or transfer leadership.');
				    	} else {
					        var conn = new Ext.data.Connection();
							conn.request({
							    url: 'fleetFittings.php',
							    method: 'POST',
							    params: {"task": "REMOVEPILOT", "fleetId": eto.fleetId, "userName": pilotName, "deletedPilot": pilotName, "hoesAmount": hoesAmount},
							    failure: function(response, opts) {
							        Ext.Msg.alert('Error', 'Server Error: Failed Request. Try again or contact an administrator');
							    },
							    success: function(response, opts) {
								    if(response.responseText == "0") {
									    Ext.Msg.alert('Error', 'You cannot leave this fleet, Bro!!!');
								    }
								    eto.reloadStore(eto);
							    }
							});
						}		
				    }
				});
	    	}
		};
		
		var updateShipDNAHandler = function(button, event) {
	    	if(event) {
		    	Ext.Msg.prompt('Enter Ship Fitting URL', instructionPrompt, function(btn, text){
				    if (btn == 'ok'){
						var conn = new Ext.data.Connection();
						conn.request({
						    url: 'fleetFittings.php',
						    method: 'POST',
						    params: {"task": "UPDATEDNA", "fleetId": eto.fleetId, "pilot": pilotName, "shipDNA": text},
						    failure: function(response, opts) {
						        Ext.Msg.alert('Error', 'Server Error: Failed Request. Try again or contact an administrator');
						    },
						    success: function(response, opts) {
							    eto.reloadStore(eto);
						    }
						});			
				    }
				});
	    	}
		};
		
		var disbandFleetHandler = function(button, event) {
	    	if(event) {
		    	Ext.MessageBox.confirm('Disband Fleet?', 'Are you sure you want to delete this fleet?', function(btn) {
		        	if(btn == "yes") {
				        var conn = new Ext.data.Connection();
						conn.request({
						    url: 'fleetConnection.php',
						    method: 'POST',
						    params: {"task": "REMOVEFLEET", "id": eto.fleetId, "pilot": pilotName},
						    failure: function(response, opts) {
						        Ext.Msg.alert('Error', 'Server Error: Failed Request. Try again or contact an administrator');
						    },
						    success: function(response, opts) {
							    FleetManagement.showFleets();
						    }
						});			
				    }
				});
	    	}
		};
		
		var removePilotHandler = function(button, event) {
	    	if(event) {
		    	var selectedRecord = sm2.getSelected();
		    	if(selectedRecord.get('pilot') == pilotName && eto.isFleetCommander) {
			    	Ext.Msg.alert('Cannot do', 'Sorry, mate, but you are a fleet commander. You can disband the fleet or transfer leadership.');
		    	} else {
			    	Ext.MessageBox.confirm('Remove Pilot?', 'Are you sure you want to remove ' + selectedRecord.get('pilot') + '?' , function(btn) {
				    	if(btn == "yes") {
					        var conn = new Ext.data.Connection();
							conn.request({
							    url: 'fleetFittings.php',
							    method: 'POST',
							    params: {"task": "REMOVEPILOT", "id": selectedRecord.get("id"), "fleetId": eto.fleetId, "userName": pilotName, "deletedPilot": selectedRecord.get("pilot"), "hoesAmount": hoesAmount},
							    failure: function(response, opts) {
							        Ext.Msg.alert('Error', 'Server Error: Failed Request. Try again or contact an administrator');
							    },
							    success: function(response, opts) {
								    if(response.responseText == "0") {
									    Ext.Msg.alert('Error', 'Cannot delete this pilot.');
								    } else if(response.responseText == "fagony") {
									    Ext.Msg.alert('Error', 'You must be in Agony.');
								    }
								    
								    eto.reloadStore(eto);
							    }
							});
						}
					});
				}		
	    	}
		};
		
		var transferOwnershipHandler = function(button, event) {
	    	if(event) {
		    	var selectedRecord = sm2.getSelected();
		    	Ext.MessageBox.confirm('Transfer Ownership?', 'Are you sure you want to transfer ownership to ' + selectedRecord.get('pilot') + '?', function(btn) {
		        	if(btn == "yes") {
				        var conn = new Ext.data.Connection();
						conn.request({
						    url: 'fleetConnection.php',
						    method: 'POST',
						    params: {"task": "TRANSFEROWNERSHIP", "id": eto.fleetId, "pilot": selectedRecord.get('pilot'), "userName": pilotName},
						    failure: function(response, opts) {
						        Ext.Msg.alert('Error', 'Server Error: Failed Request. Try again or contact an administrator');
						    },
						    success: function(response, opts) {
							    eto.reloadStore(eto);
							    if(selectedRecord.get('pilot') != pilotName) {
								    eto.isFleetCommander = false;
							    }
							    sm2.deselectRange(0,sm2.getCount());
						    }
						});			
				    }
				});
	    	}
		};
		
		var makeXOHandler = function(button, event) {
	    	if(event) {
		    	var selectedRecord = sm2.getSelected();
		        var conn = new Ext.data.Connection();
				conn.request({
				    url: 'fleetConnection.php',
				    method: 'POST',
				    params: {"task": "MAKEXO", "id": eto.fleetId, "pilot": selectedRecord.get('pilot'), "userName": pilotName},
				    failure: function(response, opts) {
				        Ext.Msg.alert('Error', 'Server Error: Failed Request. Try again or contact an administrator');
				    },
				    success: function(response, opts) {
					    eto.reloadStore(eto);
					    if(selectedRecord.get('pilot') != pilotName) {
						    eto.isFleetCommander = false;
					    }
					    sm2.deselectRange(0,sm2.getCount());
				    }
				});
	    	}
		};
		
		var aaTrackHandler = function(button, event) {
	    	if(event) {
		    	Ext.Msg.prompt('How Many Tracks?', 'Number of tracks per group:', function(btn, text){
				    if (btn == 'ok') {
					    if(text.match(/^\d$/)) {							    
					        var conn = new Ext.data.Connection();
							conn.request({
							    url: 'fleetFittings.php',
							    method: 'POST',
							    params: {"task": "AATRACK", "fleetId": eto.fleetId, "max": text},
							    failure: function(response, opts) {
							        Ext.Msg.alert('Error', 'Server Error: Failed Request. Try again or contact an administrator');
							    },
							    success: function(response, opts) {
								    eto.reloadStore(eto);
							    }
							});
						} else {
							Ext.Msg.alert('Bad Input', 'Just enter a number from 1 to 9. kthxbye.');
						}
					}
				});
	    	}
		};
		
		var aaDampHandler = function(button, event) {
	    	if(event) {
		    	Ext.Msg.prompt('How Many Damps?', 'Number of damps per group:', function(btn, text){
				    if (btn == 'ok') {
					    if(text.match(/^\d$/)) {							    
					        var conn = new Ext.data.Connection();
							conn.request({
							    url: 'fleetFittings.php',
							    method: 'POST',
							    params: {"task": "AADAMP", "fleetId": eto.fleetId, "max": text},
							    failure: function(response, opts) {
							        Ext.Msg.alert('Error', 'Server Error: Failed Request. Try again or contact an administrator');
							    },
							    success: function(response, opts) {
								    eto.reloadStore(eto);
							    }
							});
						} else {
							Ext.Msg.alert('Bad Input', 'Just enter a number from 1 to 9. kthxbye.');
						}
					}
				});
	    	}
		};		
		
		this.autoAssignTrackGroups = new Ext.menu.Item({
            text: 'Auto-Assign Track Groups',
            disabled: true,
            iconCls: 'track',
            handler: aaTrackHandler,
        });
        
        this.autoAssignDampGroups = new Ext.menu.Item({
            text: 'Auto-Assign Damp Groups',
            disabled: true,
            iconCls: 'damp',
            handler: aaDampHandler,
        });
		
    	var summary = new Ext.ux.grid.GridSummary();
    	
    	eto.transferOwnershipButton = new Ext.menu.Item({
            text: 'Transfer Fleet Ownership',
            disabled: true,
            iconCls: 'person',
            handler: transferOwnershipHandler,
        });
        
        eto.makeXOButton = new Ext.menu.Item({
            text: 'Make XO',
            disabled: true,
            iconCls: 'xoPerson',
            handler: makeXOHandler,
        });
        
	    // create the Grid
	    Ext.apply(this, {
	        store: this.fleetCompositionStore,
	        tbar: [{
	            text: 'Back To Fleet List',
	            iconCls: 'back',
	            handler: backToFleetListHandler,
	        },'-',{
	            text: 'Join Fleet',
	            iconCls: 'join',
	            handler: joinFleetHandler,
	            disabled: this.inFleet,
	        },'-',{
	            text: 'Update Fitting',
	            disabled: !this.inFleet,
	            handler: updateShipDNAHandler,
	        },'-',{
	            text: 'Refresh',
	            iconCls: 'refresh',
	            handler: compRefreshHandler,
	        },'->',{
	            text: 'Leave Fleet',
	            iconCls: 'leave',
	            handler: leaveFleetHandler,
	            disabled: !this.inFleet,
	        },{
	            text: 'Remove Pilot',
	            iconCls: 'delete',
	            disabled: true,
	            handler: removePilotHandler,
	        },{
	            xtype:'splitbutton',
	            text: 'FC Tools',
	            iconCls: 'edit',
	            menu: [eto.transferOwnershipButton,eto.makeXOButton,eto.autoAssignTrackGroups,eto.autoAssignDampGroups]
	        },{
	            text: 'Disband Fleet',
	            iconCls: 'stop',
	            handler: disbandFleetHandler,
	        }],
	        columns: [
	            {header: 'Pilot Name', width: 150, sortable: true, dataIndex: 'pilot',summaryType: 'count',summaryRenderer: function(v, params, data) {return ((v === 0 || v > 1) ? '(' + v +' Pilots)' : '(1 Pilot)');},},
	            {header: '<img src="images/SHIP.ico"/', width: 100, sortable: true, dataIndex: 'shipName',},
	            {header: '<img src="images/WARPSCRAMBLER.ico"/>', tooltip: "Warp Scramblers", width: 37, sortable: true, dataIndex: 'scrams',summaryType: 'sum',},
	            {header: '<img src="images/WARPDISRUPTOR.ico"/', tooltip: "Warp Disruptors", width: 37, sortable: true, dataIndex: 'points',summaryType: 'sum',},
	            {header: '<img src="images/STASISWEBIFIER.ico"/', tooltip: "Webs", width: 37, sortable: true, dataIndex: 'webs',summaryType: 'sum',},
	            {header: '<img src="images/CALDARIJAMMER.ico"/', tooltip: "Caldari Jammer", width: 37, sortable: true, dataIndex: 'caldECM',summaryType: 'sum',},
	            {header: '<img src="images/MINMATARJAMMER.ico"/', tooltip: "Minmatar Jammer", width: 37, sortable: true, dataIndex: 'minmECM',summaryType: 'sum',},
	            {header: '<img src="images/AMARRJAMMER.ico"/', tooltip: "Amarr Jammer", width: 37, sortable: true, dataIndex: 'amarECM',summaryType: 'sum',},
	            {header: '<img src="images/GALLENTEJAMMER.ico"/', tooltip: "Gallente Jammer", width: 37, sortable: true, dataIndex: 'galeECM',summaryType: 'sum',},
	            {header: '<img src="images/AMARRJAMMER.ico"/', tooltip: "Multispec Jammer", width: 37, sortable: true, dataIndex: 'multECM',summaryType: 'sum',},
	            {header: '<img src="images/SENSORDAMPENER.ico"/', tooltip: "Sensor Dampners", width: 37, sortable: true, dataIndex: 'damps',summaryType: 'sum',},
	            {header: '<img src="images/PAINTER.ico"/', tooltip: "Target Painters", width: 37, sortable: true, dataIndex: 'paints',summaryType: 'sum',},
	            {header: '<img src="images/TRACKINGDISRUPTOR.ico"/', tooltip: "Tracking Disruptors", width: 37, sortable: true, dataIndex: 'tracks',summaryType: 'sum',},
	            {header: '<img src="images/NEUTRALIZER.ico"/', tooltip: "Energy Neutralizers/Vampires", width: 37, sortable: true, dataIndex: 'neuts',summaryType: 'sum',},
	            {header: '<img src="images/SHIELDTRANSFERARRAY.ico"/', tooltip: "Shield Transfer Array", width: 37, sortable: true, dataIndex: 'rshield',summaryType: 'sum',},
	            {header: '<img src="images/ENERGYTRANSFERARRAY.ico"/', tooltip: "Energy Transfer Array", width: 37, sortable: true, dataIndex: 'rcap',summaryType: 'sum',},
	            {header: '<img src="images/REPAIRER.ico"/', tooltip: "Armor Repairer", width: 37, sortable: true, dataIndex: 'rarmor',summaryType: 'sum',},
	            {header: '<img src="images/REINFORCEDBULKHEADS.ico"/', tooltip: "Hull Repairer", width: 37, sortable: true, dataIndex: 'rhull',summaryType: 'sum',},
	            {header: '<img src="images/SHIPSCANNER.ico"/', tooltip: "Ship Scanner", width: 37, sortable: true, dataIndex: 'scanner',summaryType: 'sum',},
	            {header: '<img src="images/RAILGUNL.ico"/', tooltip: "DPS", width: 37, sortable: true, dataIndex: 'dps',summaryType: 'sum',},
	            {id: 'trackColumn', header: 'TG', tooltip: "Tracking Group", width: 37, sortable: true, dataIndex: 'trackGroup',
	            	editor: new Ext.form.NumberField({
	                    allowBlank: true,
	                    allowNegative: false,
	                    maxValue: 100,
	                    
                	}), editable: false,
                },
	            {id: 'dampColumn', header: 'DG', tooltip: "Damping Group", width: 37, sortable: true, dataIndex: 'dampGroup',
	            	editor: new Ext.form.NumberField({
	                    allowBlank: true,
	                    allowNegative: false,
	                    maxValue: 100
                	}), editable: false,
                },

	        ],
	        plugins: [summary], // have the EditorGridPanel use the GridSummary plugin
	        stripeRows: true,
	        sm: sm2,
	        clicksToEdit: 1,
	        autoHeight: true,
	        frame: true,
	        maxHeight: 400,
	        height: 'auto',
	        width: 1020,
	        title: 'Fleet Composition (Saved Automatically)',
	    });
	    
	     // if row is the FC - highlight the row
	    this.getView().getRowClass = function(record, index){
		    if(record.data.pilot == pilotName && record.data.isFC) {
			    return 'purple-row';
		    } else if(record.data.pilot == pilotName && record.data.isXO) {
			    return 'pink-row';
		    } else if(record.data.pilot == pilotName) {
			    return 'blue-row';
		    } else if(record.data.isFC) {
			    return 'red-row';
		    } else if(record.data.isXO) {
			    return 'orange-row';
		    }
   		};
    
		//this.on('activate', this.onActivated, this);
		sm2.on('rowselect', this.onRowSelect, this);
		sm2.on('rowdeselect', this.onRowDeselect, this);
		this.on('rowdblclick', this.onRowDblClick, this);
		this.fleetCompositionStore.on('update', function(store, record, operation) {
		    //eto.fleetCompositionStore.groupBy('language',true);
		    if(record.skipSubmit) {
			    record.skipSubmit = false;
		    } else {
			    var conn = new Ext.data.Connection();
			    // find changes
			    var changes = record.getChanges();
			    for(var change in changes) {
					conn.request({
					    url: 'fleetFittings.php',
					    method: 'POST',
						params: {"task": "UPDATEPILOT", "changedType": change, "newValue": changes[change], "id": record.get("id")},
					    failure: function(response, opts) {
					        Ext.Msg.alert('Error', 'Server Error: Failed Update. Try again or contact an administrator');
					        record.reject(true);
					    },
					    success: function(response, opts) {
						    if(response.responseText == "0") {
							    Ext.Msg.alert('Error', 'Error while updating this pilot');
						    } else if(response.responseText == "fagony") {
							    Ext.Msg.alert('Error', 'You must be in Agony.');
						    } else {						    
								record.skipSubmit = true;
								record.commit();
							}
					    }
					});
				}
			}
	    });
	    
    	FleetCompositionGrid.superclass.initComponent.call(this);
    },
	constructor: function(fleetId, motherPanel) {
		this.fleetId = fleetId;
		this.motherPanel = motherPanel;
		FleetCompositionGrid.superclass.constructor.call(this);
    },
    
    onRowSelect: function(sm, rowIndex, r) {
	    this.getTopToolbar().getComponent(9).enable();
	    if(this.isFleetCommander) {
		    var selectedRecord = sm.getSelected();
		    if(selectedRecord.get('pilot') != pilotName) {
	    		this.transferOwnershipButton.enable();
	    		this.makeXOButton.enable();
    		}
    	}
    },
    
    onRowDeselect: function(sm, rowIndex, r) {
	    this.getTopToolbar().getComponent(9).disable();
	    this.transferOwnershipButton.disable();
	    this.makeXOButton.disable();
    },
    
    onRowDblClick: function(g, rowIndex, e) {   
        var selectedRecord = g.getStore().getAt(rowIndex);
	    showFitting(selectedRecord.get("shipDNA"));
    },
    
    pilotInFleet: function(isThatRight) {
	    // if in fleet
	    if(isThatRight) {
		    this.getTopToolbar().getComponent(2).disable();
		    this.getTopToolbar().getComponent(8).enable();
		    this.getTopToolbar().getComponent(4).enable();
		// if not in the fleet
	    } else {
		    this.getTopToolbar().getComponent(2).enable();
		    this.getTopToolbar().getComponent(8).disable();
		    this.getTopToolbar().getComponent(4).disable();
	    }
    },
    
    loadRecord: function() {
	    this.getStore().removeAll();
	    var count = this.summaryStore.getCount();
	    if(count > 0) {
		    var rec = this.summaryStore.getAt(0);
		    var recordArray = new Array();
		    var compositionArray = rec.get('composition');
			
		    if(compositionArray instanceof Array) {
			    for(var c = 0; c < compositionArray.length; c++) {
				    var objToPass = compositionArray[c];
				    var obb = compositionArray[c];
				    recordArray[c] = new Ext.data.Record(compositionArray[c]);
			    }
		    }
		    this.getStore().add(recordArray);
	    }
    },
    setStore: function(store) {
	    this.summaryStore = store;
	    if(this.gridLoaded) {
	    	this.loadRecord(this);
    	}
    },
    
    reloadStore: function() {
	    this.motherPanel.reloadStore();
    },
});