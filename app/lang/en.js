const pkg = require('../../package');

exports.translations = {
	language: 'English',
	navigation: {
		gateway: {
			title: 'Gateway',
			description: 'Upload your site'
		},
		node: {
			title: 'Node',
			description: 'Peer-to-peer network'
		},
		dashboard: {
			title: 'Dashboard',
			description: 'Manage your site'
		},
		bazaar: {
			title: 'Bazaar',
			description: 'Plugin marketplace'
		},
		hosting: {
			title: 'Hosting',
			description: 'Usage and billing'
		},
		labs: {
			title: 'Labs',
			description: 'Development kit'
		},
		'about-me': {
			watermark: `Konjure Desktop App v${pkg.version}`
		},
		settings: {
			title: 'Settings',
			description: 'Application settings'
		}
	},
	gateway: {
		upload: 'Upload your website',
		cancel: 'Cancel',
		publish: 'Publish',
    close: 'Close',
		dragdrop: 'Drag & drop a zip file here',
		'open-in-browser': 'Click to open in browser',
		'upload-window': {
			'archive-file-types': 'Archive File Types',
			'all-file-types': 'All File Types'
		}
	},
  node: {
	  title: 'Konjure Node',
    status: {
	    up: 'ON',
      down: 'OFF',
      starting: 'STARTING'
    },
    cpu: {
	    title: 'CPU',
      description: 'Select how much CPU you would like Konjure to use'
    },
    memory: {
	    title: 'MEMORY',
      description: 'Select how much RAM Konjure can use (%s total)'
    }
  }
};
