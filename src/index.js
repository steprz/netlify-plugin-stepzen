// This is the main file for the Netlify Build plugin stepzen.
const stepzen = require('@stepzen/sdk')

async function run(args) {
  const {
    STEPZEN_ACCOUNT,
    STEPZEN_ADMIN_KEY,
    STEPZEN_FOLDER = 'netlify',
    STEPZEN_NAME,
  } = args.netlifyConfig.build.environment

  // If there are no parameters, then we should exit with no error.
  if (
    [STEPZEN_ACCOUNT, STEPZEN_ADMIN_KEY, STEPZEN_FOLDER, STEPZEN_NAME].every(
      (element) => !element,
    )
  ) {
    // No parameters, have to not fail.
    return args.utils.status.show(
      'Successfully called the stepzen plugin, but no stepzen configuration found, exiting',
    )
  }

  // Ensure that required areguments are present.
  if (!STEPZEN_ACCOUNT) {
    return args.utils.build.failBuild(
      'Failed finding the STEPZEN_ACCOUNT in the Netlify Environment Variables.',
    )
  }

  if (!STEPZEN_ADMIN_KEY) {
    return args.utils.build.failBuild(
      'Failed finding the STEPZEN_ADMIN_KEY in the Netlify Environment Variables.',
    )
  }

  if (!STEPZEN_NAME) {
    return args.utils.build.failBuild(
      'Failed finding the STEPZEN_NAME in the Netlify Environment Variables.',
    )
  }

  // Now construct all the parameters we need.
  const endpoint = `${STEPZEN_FOLDER}/${STEPZEN_NAME}`
  const configurationSets = ['stepzen/default']

  console.info(
    `%c Deploying from StepZen account: ${STEPZEN_ACCOUNT}`,
    'color:#ffffff;font-weight: 600;border-color: #8b6091;border-width: 2px 0 0;border-radius:5px',
  )
  console.info(
    `%c using configuration sets ${configurationSets}`,
    'color:#ffffff;font-weight: 600',
  )
  console.info(
    `%c Pushing schema to ${endpoint}`,
    'color:#ffffff;font-weight: 600',
  )

  try {
    const client = await stepzen.client({
      account: STEPZEN_ACCOUNT,
      adminkey: STEPZEN_ADMIN_KEY,
    })

    await client.upload.schema(endpoint, 'stepzen')

    await client.deploy(endpoint, {
      configurationsets: configurationSets,
      schema: endpoint,
    })
  } catch (e) {
    return args.utils.build.failBuild(
      `Failed to upload and deploy your API endpoint to Stepzen. Use the stepzen tool to debug this issue further`,
      { error: e },
    )
  }

  console.info(
    `%c Your endpoint is available at https://${STEPZEN_ACCOUNT}.stepzen.net/${endpoint}/__graphql`,
    'color:#ffffff;font-weight: 600;border-color: #8b6091;border-width: 0 0 2px;border-radius:5px',
  )
}

module.exports = {
  async onPreBuild(args) {
    await run(args)
    args.utils.status.show({ summary: 'Success!' })
  },
}
