'use strict';

exports.mainChoices =  [
	{ 
		name: 'Connect to poi via uart',
	   	value: 'connect'
   	},
   	{ 
		name: 'Connect to poi via wifi',
	   	value: 'wifi_connect'
	},
	{ 
		name: 'Disconnect',
	   	value: 'disconnect'
   	},
   	{
	   	name: 'Upload show', 
		value:'up_show'
	} ,
	{
		name: 'Upload show without images', 
	 	value:'up_show_prog'
 	} ,
   	{
		name: 'Upload image', 
	   	value:'up_image'
	} ,
	{
		name: 'Upload program', 
	   	value:'up_prog'
   	} ,
   	{
		name: 'Start program', 
		value:'start_prog'
   	},
   	{
		name: 'Stop processing', 
	   	value:'stop_proc'
	},
	{
		name: 'Pause/resume processing', 
	   	value:'pause_proc'
	},
	{
		name: 'Send wifi connect', 
	   	value:'ip_connect'
   	},
	   {
		name: 'Send wifi disconnect', 
	   	value:'ip_disconnect'
   	},
	   {
		name: 'Send client disconnect', 
	   	value:'client_disconnect'
   	},
	   {
		name: 'Work with poi ensemble', 
	   	value:'ensemble_menu'
   	},
   	{
		name: 'Sync', 
	   	value:'sync'
   	},
   	{
		name: 'Status', 
	   	value:'status'
	},
	{
		name: 'Selftest', 
	   	value:'selftest'
   	},
	{
		name: 'Init flash', 
	   	value:'initFlash'
   	},
   	{
	   	name: 'Exit', 
		value:'exit'
	} 
];

exports.ensembleChoices =  [
	{ 
		name: 'Connect unconnected pois',
		value: 'ens_connect'
    },
    { 
		name: 'Show poi connection status',
		value: 'ens_show_status'
    },
    { 
		name: 'Send client disconnect',
		value: 'ens_client_disconnect'
	},
   	{ 
		name: 'Start pois',
		value: 'ens_start_prog'
	},
	{ 
		name: 'Stop pois',
		value: 'ens_stop_proc'
	},
	{ 
		name: 'Pause pois',
		value: 'ens_pause_proc'
	},
	{ 
		name: 'Reset connection',
		value: 'ens_reset_conn'
	},
	{ 
		name: 'Return to main menu',
		value: 'ens_return_main'
	}
];
