FleetsGrid = Ext.extend(Ext.grid.GridPanel, {
	fleetStore: '',
	
	initComponent:function() {
		var eto = this;
	    // create the data store
	    this.fleetStore = new Ext.data.Store({
	      id: 'fleetStore',
	      proxy: new Ext.data.HttpProxy({
	          url: 'fleetConnection.php',      // File to connect to
	          method: 'POST'
	      }),
	      baseParams:{task: "LISTING", "pilot": pilotName, "hoesAmount": hoesAmount}, // this parameter asks for listing
	      reader: new Ext.data.JsonReader({   
	      // we tell the datastore where to get his data from
	        root: 'results',
	        totalProperty: 'total',
	        id: 'id'
	      },[ 
	        {name: 'id', type: 'int', mapping: 'id'},
	        {name: 'fleetOwner', type: 'string', mapping: 'fleetOwner'},
	        {name: 'fleetXO', type: 'string', mapping: 'fleetXO'},
	        {name: 'createdOn', mapping: 'createdOn'},
	        {name: 'about', type: 'string', mapping: 'about'},
	        {name: 'description', type: 'string', mapping: 'description'},
	        {name: 'memberCount', type: 'int', mapping: 'memberCount'},
	        {name: 'joined', type: 'boolean', mapping: 'joined'},
	        {name: 'isPublic', type: 'int', mapping: 'isPublic'},
	      ]),
	      sortInfo: {
			field: 'createdOn',
			direction: 'ASC' // or 'DESC' (case sensitive for local sorting)
		  },
	    });
	    
	    this.fleetStore.load();
	
	    var sm1 = new Ext.grid.RowSelectionModel({singleSelect:true});
	    
	    var summaryRefreshHandler = function(button, event) {
	    	if(event) {
		    	eto.fleetStore.reload();
	    	}
		};
		
		var summaryViewFleetHandler = function(button, event) {
	    	if(event) {
		    	var selectedRecord = sm1.getSelected();
		    	var isFC = false;
		    	if(selectedRecord) {
			    	if(selectedRecord.get('fleetOwner') == pilotName) {
				    	isFC = true;
			    	}
        			FleetManagement.showFleetFittings(selectedRecord.get("id"), isFC);
    			}
	    	}
		};
		
		var summaryNewFleetHandler = function(button, event) {
	    	if(event) {
		    	Ext.Msg.prompt('Description', 'Describe the purpose of the fleet:', function(btn, text){
				    if (btn == 'ok'){
				        var conn = new Ext.data.Connection();
						conn.request({
						    url: 'fleetConnection.php',
						    method: 'POST',
						    params: {"task": "CREATEFLEET", "about": text, "fleetOwner": pilotName, "hoesAmount": hoesAmount},
						    failure: function(response, opts) {
						        Ext.Msg.alert('Error', 'Server Error: Failed Request. Try again or contact an administrator');
						    },
						    success: function(response, opts) {
							    if(response.responseText == "0") {
								    Ext.Msg.alert('Error', 'You cannot create a fleet...');
							    }
							    eto.fleetStore.reload();
						    }
						});			
				    }
				});
	    	}
		};
		
		var summaryRemoveFleetHandler = function(button, event) {
	    	if(event) {
		    	var selectedRecord = sm1.getSelected();
		    	Ext.MessageBox.confirm('Delete Fleet?', 'Are you sure you want to delete this fleet?', function(btn) {
		        	if(btn == "yes") {
				        var conn = new Ext.data.Connection();
						conn.request({
						    url: 'fleetConnection.php',
						    method: 'POST',
						    params: {"task": "REMOVEFLEET", "id": selectedRecord.get("id"), "pilot": pilotName},
						    failure: function(response, opts) {
						        Ext.Msg.alert('Error', 'Server Error: Failed Request. Try again or contact an administrator');
						    },
						    success: function(response, opts) {
							    if(response.responseText == "0") {
								    Ext.Msg.alert('Error', 'You cannot remove this fleet...');
							    }
							    eto.fleetStore.reload();
						    }
						});			
				    }
				});
	    	}
		};
		
		var joinFleetHandler = function(button, event) {
	    	if(event) {
		    	Ext.Msg.prompt('Enter Ship Fitting URL', instructionPrompt, function(btn, text){
				    if (btn == 'ok'){
					    var selectedRecord = sm1.getSelected();
						var conn = new Ext.data.Connection();
						conn.request({
						    url: 'fleetFittings.php',
						    method: 'POST',
						    params: {"task": "JOIN", "fleetId": selectedRecord.get('id'), "pilot": pilotName, "shipDNA": text},
						    failure: function(response, opts) {
						        Ext.Msg.alert('Error', 'Server Error: Failed Request. Try again or contact an administrator');
						    },
						    success: function(response, opts) {
							    eto.fleetStore.reload();
						    }
						});			
				    }
				});
	    	}
		};
		
		var togglePrivacy = function(button, event) {
	    	if(event) {
			    var selectedRecord = sm1.getSelected();
				var conn = new Ext.data.Connection();
				var opposite = 1;
				if(selectedRecord.get('isPublic') == 1) {
					opposite = 0;
				}
				conn.request({
				    url: 'fleetConnection.php',
				    method: 'POST',
				    params: {"task": "UPDATEPUBLIC", "id": selectedRecord.get('id'), "hoesAmount": hoesAmount, "isPublic": opposite},
				    failure: function(response, opts) {
				        Ext.Msg.alert('Error', 'Server Error: Failed Request. Try again or contact an administrator');
				    },
				    success: function(response, opts) {
					    if(response.responseText == "fagony") {
						    Ext.Msg.alert('Error', 'You cannot do this...');
					    }
					    eto.fleetStore.reload();
				    }
				});	
	    	}
		};
		
		function joined (val){
	        if(val){
	            return '<span style="color:green;">' + "YES" + '</span>';
	        } else {
	            return '<span style="font-weight:bold; color:red;">' + "NO" + '</span>';
	        }
	        return val;
	    }
	    
	    function private (val){
	        if(!val){
	            return '<span style="color:green;">' + "YES" + '</span>';
	        } else {
	            return '<span style="font-weight:bold; color:red;">' + "NO" + '</span>';
	        }
	        return val;
	    }
	    	
	    // create the Grid
	    Ext.apply(this, {
	        store: this.fleetStore,
	        tbar: [{
	            text: 'Create New Fleet',
	            iconCls: 'create',
	            handler: summaryNewFleetHandler,
	        },'-',{
	            text: 'View Fleet',
	            disabled: true,
	            iconCls: 'info',
	            handler: summaryViewFleetHandler,
	        },{
	            text: 'Toggle Privacy',
	            disabled: true,
	            iconCls: 'privacy',
	            handler: togglePrivacy,
	        },{
	            text: 'Join Fleet',
	            iconCls: 'join',
	            disabled: true,
	            handler: joinFleetHandler,
	        },'-',{
	            text: 'Refresh',
	            iconCls: 'refresh',
	            handler: summaryRefreshHandler,
	        },'->',{
	            text: 'Remove Fleet',
	            iconCls: 'delete',
	            disabled: true,
	            handler: summaryRemoveFleetHandler,
	        }],
	        columns: [
	            {header: 'Created On (GMT)', width: 150, sortable: true, dataIndex: 'createdOn'},
	            {header: 'Owner', width: 100, sortable: true, dataIndex: 'fleetOwner'},
	            {header: 'XO', width: 100, sortable: true, dataIndex: 'fleetXO'},
	            {header: 'Pilots', width: 50, sortable: true, dataIndex: 'memberCount'},
	            {header: 'Title', width: 250, sortable: false, dataIndex: 'about'},
	            {header: 'Joined', width: 46, sortable: true, dataIndex: 'joined', renderer: joined},
	            {header: 'Private', width: 46, sortable: true, dataIndex: 'isPublic', renderer: private},
	        ],
	        stripeRows: true,
	        sm: sm1,
	        autoHeight: true,
	        frame: true,
	        height: 'auto',
	        width: 755,
	        title: 'Available Fleets',	        
	    });
	    
	    this.on('rowdblclick', this.onRowDblClick, this);
		sm1.on('rowselect', this.onRowSelect, this);
		sm1.on('rowdeselect', this.onRowDeselect, this);
	   	FleetsGrid.superclass.initComponent.call(this);
   	},
		
   	constructor: function() {
		FleetsGrid.superclass.constructor.call(this);
    },
	    
	onRowSelect: function(sm, rowIndex, r) {   
        this.getTopToolbar().getComponent(2).enable();
        this.getTopToolbar().getComponent(3).enable();
        // dont enable if user is already in the fleet
        if(!sm.getSelected().get('joined')) {
        	this.getTopToolbar().getComponent(4).enable();
    	}
        this.getTopToolbar().getComponent(8).enable();
    },
    
	onRowDeselect: function(sm, rowIndex, r) {   
        this.getTopToolbar().getComponent(2).disable();
        this.getTopToolbar().getComponent(3).disable();
        this.getTopToolbar().getComponent(4).disable();
        this.getTopToolbar().getComponent(8).disable();
    },
    onRowDblClick: function(g, rowIndex, e) {   
        var selectedRecord = g.getStore().getAt(rowIndex);
    	//var isFC = false;
    	if(selectedRecord) {
	    	//if(selectedRecord.get('fleetOwner') == pilotName) {
		    //	isFC = true;
	    	//}
			FleetManagement.showFleetFittings(selectedRecord.get("id"));
		}
    },
});