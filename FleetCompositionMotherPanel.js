FleetCompositionMotherPanel = Ext.extend(Ext.Panel, {
	fleetId: '',
	compositionGrid: '',
	summaryPanel: '',
	
    initComponent:function() {
	    var eto = this;
	    // turn on validation errors beside the field globally
	    Ext.form.Field.prototype.msgTarget = 'side';
		
        this.emptyContainer = new Ext.Container();
        this.compositionGrid = new FleetCompositionGrid(this.fleetId, this);
        this.summaryPanel = new FleetSummaryPanel(this.fleetId, this);
        
        this.mainStore = new Ext.data.Store({
	      id: 'mainStore',
	      proxy: new Ext.data.HttpProxy({
	      	url: 'fleetFittings.php',      // File to connect to
	        method: 'POST'
	      }),
	      baseParams:{task: "LISTING", "fleetId": this.fleetId}, // this parameter asks for listing
	      reader: new Ext.data.JsonReader({   
	      // we tell the datastore where to get his data from
	        root: 'results',
	        totalProperty: 'total',
	        id: 'id'
	      },[ 
	        {name: 'id', type: 'int', mapping: 'id'},
	        {name: 'fleetOwner', type: 'string', mapping: 'fleetOwner'},
	        {name: 'fleetXO', type: 'string', mapping: 'fleetXO'},
	        {name: 'createdOn', type: 'string',mapping: 'createdOn'},
	        {name: 'about', type: 'string',mapping: 'about'},
	        {name: 'memberCount', type: 'int',mapping: 'memberCount'},
	        {name: 'isPublic', type: 'int',mapping: 'isPublic'},
	        {name: 'composition', mapping: 'composition'},
	      ]),
	    });
        
	   	this.mainStore.on('load', function() {
		   	eto.compositionGrid.setStore(eto.mainStore);
		   	eto.summaryPanel.setStore(eto.mainStore);
	   	});
		this.mainStore.load();
		    
	    Ext.apply(this, {
		    // TAB main
            //title: 'Fleet Composition',
            //frame: true,
            //anchor:'95%',
            //bodyStyle: 'padding:10 10;',
            //baseCls: 'cookBackground',
            //closable:true,
            layout: 'form',
            width: 1050,
            hideMode: 'offsets',
            defaults: {
	            style:'padding:10px',
            },
            items: [this.summaryPanel, this.compositionGrid]
		});
	    
    	this.on('afterrender', function() {
		});
    	
		FleetCompositionMotherPanel.superclass.initComponent.call(this);
    },
    
    constructor: function(fleetId) {
		this.fleetId = fleetId;
		FleetCompositionMotherPanel.superclass.constructor.call(this);
    },
    reloadStore: function() {
	    this.mainStore.reload();
    },
	    
});