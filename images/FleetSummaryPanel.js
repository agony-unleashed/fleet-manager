FleetSummaryPanel = Ext.extend(Ext.Panel, {
	fleetId: '',
	motherPanel: '',
	summaryStore: '',
	isXO: false,
	isFC: false,
	readOnly: true,
	descriptionValue: '',
	
    initComponent:function() {
    	var eto = this;
    	
    	var saveHandler = function(button, event) {
	    	if(event) {
		    	var titleValue = '';
		    	var descriptionValue = '';
		        var conn = new Ext.data.Connection();
		        var fieldSet = eto.getComponent('statsFieldSet');
			    if(fieldSet) {
				    var component = fieldSet.getComponent('title');
				    titleValue = component.getValue();
			    }
			    fieldSet = eto.getComponent('descFieldSet');
			    if(fieldSet) {
				    var component = fieldSet.getComponent('description');
				    descriptionValue = component.getValue();
			    }
				    
				conn.request({
				    url: 'fleetConnection.php',
				    method: 'POST',
				    params: {"task": "UPDATEINFO", "about": titleValue, "id": eto.fleetId, "description": descriptionValue, "userName": pilotName, "hoesAmount": hoesAmount},
				    failure: function(response, opts) {
				        Ext.Msg.alert('Error', 'Server Error: Failed Request. Try again or contact an administrator');
				    },
				    success: function(response, opts) {
					    if(response.responseText == "0") {
						    Ext.Msg.alert('Error', 'You cannot save this information...');
					    } else {
						    Ext.Msg.alert('w00t', 'Saved Successfully!!!');
					    }
					    eto.motherPanel.reloadStore();
				    }
				});			
	    	}
		};
		
	    Ext.apply(this, {
		    // TAB main
            title:'Fleet Summary',
            frame: true,
            collapsible: true,
            layout:'table',
            bodyStyle:'padding:10px',
            layoutConfig: {
			    columns: 2
			},
            width: 1020,
            hideMode: 'offsets',    
            items: [{               
                xtype:'fieldset',
                title: 'Fleet Stats',
                labelWidth: 120,
                colspan:1,
                autoHeight: true,
                
                itemId: 'statsFieldSet',
                defaults: {
	                labelStyle: 'font-weight:bold;'
	            },
                items: [{
                    xtype: 'displayfield',
                    fieldLabel: 'Fleet Commander',
                    itemId: 'fleetCommander',
                },{
                    xtype: 'displayfield',
                    fieldLabel: 'XO',
                    itemId: 'executiveOfficer',
                },{
                    xtype: 'displayfield',
                    fieldLabel: 'Created On (GMT)',
                    itemId: 'createdDate',
                },{
                    xtype: 'displayfield',
                    fieldLabel: 'Privacy',
                    itemId: 'privacy',
                },{
                    xtype: 'textfield',
                    fieldLabel: 'Title',
                    readOnly: this.readOnly,
                    width: 200,
                    itemId: 'title',
                }],
			},{
                xtype:'fieldset',
                title: 'Description',
                layout: 'form',
                itemId: 'descFieldSet',
                style: 'margin-left: 5',
            	border:true,
                //bodyStyle:'padding:5px 5px 0',
    			width: 630,
    			height:160,
                items: [{
    				xtype:'htmleditor',
    				itemId: 'description',
    				hideLabel: true,
    				width: 600,
    				height:120,
    				//readOnly: true,
    				anchor:'99%'
                }]
			},{               
                xtype:'fieldset',
                title: 'Ship Count',
                collapsed: true,
                collapsible: true,
                width: 320,
                style: 'margin: 5 10 0 0',
                autoHeight: true,
                itemId: 'shipCountFieldSet',
                defaults: {
	                labelStyle: 'font-weight:bold;',
	                xtype: 'displayfield',
	            },
                items: {},
			},{
                xtype:'button',
                text: 'SAVE',
                itemId: 'saveButton',
                hidden: this.readOnly,
                handler: saveHandler,
    			width: 100,
    			height:30,
                iconCls: 'save',
            }]
		});
	    
		this.on('expand', function() {
			var fieldSet = this.getComponent('descFieldSet');
	    	if(fieldSet) {
		    	var component = fieldSet.getComponent('description');
			    if(component != null) {
			    	component.setValue(this.descriptionValue);
			    	component.setReadOnly(this.readOnly);
			    	component.toggleSourceEdit(false);
		    	}	    	
	    	}
			eto.doLayout();
		});
		
    	FleetSummaryPanel.superclass.initComponent.call(this);

    },
    
    constructor: function(fleetId, motherPanel) {
        this.motherPanel = motherPanel;
        this.fleetId = fleetId;
        FleetSummaryPanel.superclass.constructor.call(this);
    },
    
    loadRecord: function() {
	    var count = this.summaryStore.getCount();
	    if(count > 0) {
		    var record = this.summaryStore.getAt(0);
		    var fieldSet = this.getComponent('statsFieldSet');
		    this.isFC = false;
		    this.isXO = false;
		    this.readOnly = true;
		    if(fieldSet) {
			    var component = fieldSet.getComponent('fleetCommander');
		    	if(component) {
			    	component.setValue(record.get("fleetOwner"));
			    	if(pilotName == record.get("fleetOwner")) {
				    	this.isFC = true;
				    	this.readOnly = false;
			    	}
		    	}	    	
		    	component = fieldSet.getComponent('executiveOfficer');
			    if(component != null) {
			    	component.setValue(record.get("fleetXO"));
			    	if(pilotName == record.get("fleetXO")) {
				    	this.isXO = true;
				    	this.readOnly = false;
			    	}
		    	}
		    	component = fieldSet.getComponent('createdDate');
			    if(component != null) {
			    	component.setValue(record.get("createdOn"));
		    	}
		    	component = fieldSet.getComponent('title');
			    if(component != null) {
			    	component.setValue(record.get("about"));
			    	component.setReadOnly(this.readOnly);
		    	}
		    	component = fieldSet.getComponent('privacy');
			    if(component != null) {
				    if(record.get("isPublic")) {
					    component.setValue("Public");
				    } else {
					    component.setValue("Private");
				    }
		    	}		    	
	    	}
	    	
	    	var saveButton = this.getComponent('saveButton');
	    	if(fieldSet) {
		    	if(this.readOnly) {
			    	saveButton.hide();
		    	} else {
			    	saveButton.show();
		    	}
	    	}
			
	    	fieldSet = this.getComponent('descFieldSet');
	    	if(fieldSet) {
		    	var component = fieldSet.getComponent('description');
			    if(component != null) {
				    this.descriptionValue = record.json.description;
			    	component.setValue(this.descriptionValue);
			    	component.setReadOnly(this.readOnly);
			    	component.toggleSourceEdit(false);
		    	}	    	
	    	}
	    	// ship count
	    	var compositionArray = record.get('composition');
	    	
	    	if(compositionArray instanceof Array) {
		    	var fieldSet = this.getComponent('shipCountFieldSet');
		    	fieldSet.removeAll();
			    for(var c = 0; c < compositionArray.length; c++) {
				    var shipType = compositionArray[c].shipType;
				    if(shipType == null || !shipType) {
					    shipType = "Unknown";
				    }
		    		if(fieldSet) {
			    		var component = fieldSet.getComponent('shipType'+shipType);
				    	if(component) {
					    	var origValue = component.getValue();
					    	origValue++;
					    	component.setValue(origValue);
				    	} else {
			    			fieldSet.add({fieldLabel: shipType, value: 1, itemId: 'shipType'+shipType});
		    			}
		    		}		    		
			    }
		    }
		    this.doLayout();
	    }
    },
    setStore: function(store) {
	    this.summaryStore = store;
	    this.loadRecord(this);
    },
});


