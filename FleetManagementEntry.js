Ext.namespace('FleetManagement');

var mainPanel = '';
var fleetFitting = '';
var summaryGrid = '';

Ext.onReady(function(){

    Ext.QuickTips.init();
    
    summaryGrid = new FleetsGrid();
    mainPanel = new Ext.Container({
	    items: summaryGrid,
	    renderTo: 'neoDiv',	    
    });
});

FleetManagement.showFleetFittings = function(fleetId) {
	summaryGrid.hide();
	mainPanel.removeAll(false);
	fleetFitting = new FleetCompositionMotherPanel(fleetId);
	mainPanel.add(fleetFitting);
	mainPanel.doLayout();
}

FleetManagement.showFleets = function() {
	fleetFitting.hide();
	var sm = summaryGrid.getSelectionModel();
	sm.deselectRange(0,sm.getCount()-1);
	summaryGrid.getStore().reload();
	summaryGrid.show();
	mainPanel.removeAll(false);
	mainPanel.add(summaryGrid);
	mainPanel.doLayout();
}