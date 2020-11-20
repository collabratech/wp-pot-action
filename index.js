const core = require('@actions/core');
const exec = require('@actions/exec');
const wpPot = require('wp-pot');


// most @actions toolkit packages have async methods
async function run() {
  try {
    const source = core.getInput('source');
    const destination = core.getInput('destination');
    const text_domain = core.getInput('text-domain');

    core.info(`Starting generation of POT file ...`);

    wpPot({
      src: source,
      destFile: destination,
      domain: text_domain,
    });

    const options = {
      ignoreReturnCode: true,
    };

    // Commit the generated POT file.
    await exec.exec('git', ['config', '--global user.email "wp-pot@wp-pot.test"'], options);
    await exec.exec('git', ['config', '--global user.name "WP Pot Bot"'], options);
    await exec.exec('git', ['add', destination], options);
    await exec.exec('git', ['commit', '-m "Automatically generated POT file"'], options);
    await exec.exec('git', ['push'], options);

    core.info(`The POT file was successfully generated.`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
