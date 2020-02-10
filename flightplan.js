var plan = require('flightplan');

var config = {
  keepReleases: 3
};

plan.target(
  'internal',
  {
    host: 'emdata1',
    username: 'deploy',
    agent: process.env.SSH_AUTH_SOCK
  },
  {
    // Shouldn't be overridden, so please don't try.
    gitCheck: true,
    projectDir: '/opt/www/neuprintexplorer', // location on the remote server
  }
);

plan.target(
  'production',
  [
    {
      host: '35.245.234.228',
      username: 'flyem',
      agent: process.env.SSH_AUTH_SOCK,
      failsafe: true
    },
    {
      host: '35.245.44.215',
      username: 'flyem',
      agent: process.env.SSH_AUTH_SOCK,
      failsafe: true
    },
    /* {
      host: '35.221.11.230',
      username: 'flyem',
      agent: process.env.SSH_AUTH_SOCK,
      failsafe: true
    },
    {
      host: '35.245.7.203',
      username: 'flyem',
      agent: process.env.SSH_AUTH_SOCK,
      failsafe: true
    } */
  ],
  {
    gitCheck: true,
    projectDir: '/opt/www/neuprintexplorer', // location on the remote server
  }
);

plan.target(
  'staging',
  {
    host: 'emdata1',
    username: 'deploy',
    agent: process.env.SSH_AUTH_SOCK
  },
  {
    // Shouldn't be overridden, so please don't try.
    gitCheck: false,
    projectDir: '/opt/www/npexplorer_staging', // location on the remote server
  }
);

plan.target(
  'test',
  {
    host: '35.194.68.179',
    username: 'flyem',
    agent: process.env.SSH_AUTH_SOCK
  },
  {
    // Shouldn't be overridden, so please don't try.
    gitCheck: true,
    projectDir: '/opt/www/neuprintexplorer', // location on the remote server
  }
);

plan.target(
  'examples',
  {
    host: '35.245.181.251',
    username: 'flyem',
    agent: process.env.SSH_AUTH_SOCK
  },
  {
    // Shouldn't be overridden, so please don't try.
    gitCheck: true,
    projectDir: '/opt/www/neuprintexplorer', // location on the remote server
  }
);



// Check if there are files that have not been committed to git. This stops
// us from deploying code in an inconsistent state. It also prevents slapdash
// changes from being deployed without a log of who added them in github. Not
// fool proof, but better than nothing.
plan.local('deploy', function(local) {
  if (plan.runtime.options.gitCheck) {
    local.log('checking git status...');
    var result = local.exec('git status --porcelain', { silent: true });

    if (result.stdout) {
      local.log(result.stdout);
      plan.abort('Uncommited files found, see list above');
    }
  } else {
    local.log('skipping git check!!!');
  }
});

plan.remote('deploy', function(remote) {
  config.deployTo = plan.runtime.options.projectDir + '/releases/' + new Date().getTime();
  remote.log('Creating webroot');
  remote.exec('mkdir -p ' + config.deployTo);
});

plan.local('deploy', function(local) {
  local.log('Building the production code');
  local.exec('npm run build');
});

// grab a list of files in the build directory and copy it.
plan.local('deploy', function(local) {
  local.with('cd build', () => {
    local.log('Transferring website files');
    var files = local.exec('find . -type f -print0', { silent: true });
    local.transfer(files, config.deployTo + '/');
  });
});

plan.remote('deploy', function(remote) {
  remote.log('Linking to new release');
  remote.exec('ln -nfs ' + config.deployTo + ' ' + plan.runtime.options.projectDir + '/current');

  remote.log('Checking for stale releases');
  var releases = getReleases(remote);

  if (releases.length > config.keepReleases) {
    var removeCount = releases.length - config.keepReleases;
    remote.log('Removing ' + removeCount + ' stale release(s)');

    releases = releases.slice(0, removeCount);
    releases = releases.map(function(item) {
      return plan.runtime.options.projectDir + '/releases/' + item;
    });

    remote.exec('rm -rf ' + releases.join(' '));
  }
});

plan.remote('rollback', function(remote) {
  remote.log('Rolling back release');
  var releases = getReleases(remote);
  if (releases.length > 1) {
    var oldCurrent = releases.pop();
    var newCurrent = releases.pop();
    remote.log('Linking current to ' + newCurrent);
    remote.exec(
      'ln -nfs ' +
        plan.runtime.options.projectDir +
        '/releases/' +
        newCurrent +
        ' ' +
        plan.runtime.options.projectDir +
        '/current'
    );

    remote.log('Removing ' + oldCurrent);
    remote.exec('rm -rf ' + plan.runtime.options.projectDir + '/releases/' + oldCurrent);
  }
});

plan.remote(['default', 'uptime'], function(remote) {
  remote.exec('uptime');
  remote.exec('whoami');
});

function getReleases(remote) {
  var releases = remote.exec('ls ' + plan.runtime.options.projectDir + '/releases', { silent: true });

  if (releases.code === 0) {
    releases = releases.stdout.trim().split('\n');
    return releases;
  }

  return [];
}
