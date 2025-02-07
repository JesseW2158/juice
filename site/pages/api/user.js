import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authToken = req.headers.authorization?.split(' ')[1];
  if (!authToken) {
    return res.status(401).json({ message: 'No auth token provided' });
  }

  try {
    // Search for user with matching token in the Signups table
    const records = await base(process.env.AIRTABLE_TABLE_NAME).select({
      filterByFormula: `{token} = '${authToken}'`,
      maxRecords: 1
    }).firstPage();

    if (records.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = records[0].fields;

    // Get juiceStretches for this user that have OMG moments, with specific fields
    const juiceStretches = await base('juiceStretches').select({
      filterByFormula: `AND(
        {email (from Signups)} = '${userData.email}',
        NOT({omgMoments} = '')
      )`,
      fields: ['ID', 'startTime', 'endTime', 'timeWorkedHours', 'timeWorkedSeconds', 'totalPauseTimeSeconds', 'Review', 'omgMoments']
    }).firstPage();

    // Calculate total duration in hours and prepare juice stretch data
    let totalHours = 0;
    userData.juiceStretches = await Promise.all(juiceStretches.map(async record => {
      const stretchTime = record.fields.timeWorkedSeconds ?? 0;
      totalHours += Math.round(stretchTime / 3600 * 100) / 100;

      // Get specific fields from OMG moments for this stretch
      const omgMomentIds = record.fields.omgMoments || [];
      const omgMoments = await Promise.all(omgMomentIds.map(async omgId => {
        const omgRecord = await base('omgMoments').find(omgId);
        const { created_at, kudos, video, description } = omgRecord.fields;
        return { created_at, kudos, video, description };
      }));

      return {
        ...record.fields,
        omgMoments
      };
    }));

    userData.totalJuiceHours = totalHours;

    // Get juiceStretches for this user
    const jungleStretches = await base('jungleStretches').select({
      filterByFormula: `{email (from Signups)} = '${userData.email}'`,
    }).firstPage();

    // Calculate total duration in hours
    let totalJungleHours = 0;
    jungleStretches.forEach(record => {
      const stretchTime = record.fields.timeWorkedSeconds == undefined ? 0 : record.fields.timeWorkedSeconds
      totalJungleHours += Math.round(stretchTime / 3600 * 100) / 100;
    });

    userData.totalJungleHours = totalJungleHours; // Rounded to 2 decimal places

    // Get all OMG moments for this user and sum up kudos
    const omgMoments = await base('omgMoments').select({
      filterByFormula: `{email} = '${userData.email}'`
    }).all();

    let totalKudos = 0;
    omgMoments.forEach(moment => {
      totalKudos += moment.fields.kudos || 0;
    });

    //Calculate total fruit
    const jungleStretchesCompleted = (await base('jungleStretches').select({
          filterByFormula: `
              AND(
              {email (from Signups)} = '${userData.email}',
              ({endtime}),
              NOT({isCanceled})
              )
          `,
        }).firstPage()).map((record) => record.fields);

      let kiwisCollected = 0;
      let lemonsCollected = 0;
      let orangesCollected = 0;
      let applesCollected = 0;
      let blueberriesCollected = 0;
      let kiwisRedeemable = 0;
      let lemonsRedeemable = 0;
      let orangesRedeemable = 0;
      let applesRedeemable = 0;
      let blueberriesRedeemable = 0;
      if(jungleStretchesCompleted.length > 0) {
          jungleStretchesCompleted.forEach((jungleRecord) => {
            if(!jungleRecord.countsForBoss){
              kiwisCollected += jungleRecord.kiwisCollected == undefined ? 0 : jungleRecord.kiwisCollected;
              lemonsCollected += jungleRecord.lemonsCollected == undefined ? 0 : jungleRecord.lemonsCollected;
              orangesCollected += jungleRecord.orangesCollected == undefined ? 0 : jungleRecord.orangesCollected;
              applesCollected += jungleRecord.applesCollected == undefined ? 0 : jungleRecord.applesCollected;
              blueberriesCollected += jungleRecord.blueberriesCollected == undefined ? 0 : jungleRecord.blueberriesCollected;
              return;
            }
            if(!jungleRecord.isRedeemed){
              kiwisRedeemable += jungleRecord.kiwisCollected == undefined ? 0 : jungleRecord.kiwisCollected;
              lemonsRedeemable += jungleRecord.lemonsCollected == undefined ? 0 : jungleRecord.lemonsCollected;
              orangesRedeemable += jungleRecord.orangesCollected == undefined ? 0 : jungleRecord.orangesCollected;
              applesRedeemable += jungleRecord.applesCollected == undefined ? 0 : jungleRecord.applesCollected;
              blueberriesRedeemable += jungleRecord.blueberriesCollected == undefined ? 0 : jungleRecord.blueberriesCollected;
              return;
            }
        })
      }

      //Get conversion rate from db
      const tokenFruitConversionRecrods = await base("fruitPricesProbabilities - Do not modify").select({}).firstPage();

      // Get conversion rates for all fruits
      const kiwiConversion = tokenFruitConversionRecrods.find(record => record.fields.fruit === 'kiwis');
      const lemonConversion = tokenFruitConversionRecrods.find(record => record.fields.fruit === 'lemons');
      const orangeConversion = tokenFruitConversionRecrods.find(record => record.fields.fruit === 'oranges');
      const appleConversion = tokenFruitConversionRecrods.find(record => record.fields.fruit === 'apples');
      const blueberryConversion = tokenFruitConversionRecrods.find(record => record.fields.fruit === 'blueberries');

      // Get token rates with fallback to 0
      const kiwiTokenRate = kiwiConversion ? kiwiConversion.fields.tokens : 0;
      const lemonTokenRate = lemonConversion ? lemonConversion.fields.tokens : 0;
      const orangeTokenRate = orangeConversion ? orangeConversion.fields.tokens : 0;
      const appleTokenRate = appleConversion ? appleConversion.fields.tokens : 0;
      const blueberryTokenRate = blueberryConversion ? blueberryConversion.fields.tokens : 0;

      // Convert fruit to tokens
      const kiwiTokens = kiwisCollected * kiwiTokenRate;
      const lemonTokens = lemonsCollected * lemonTokenRate;
      const orangeTokens = orangesCollected * orangeTokenRate;
      const appleTokens = applesCollected * appleTokenRate;
      const blueberryTokens = blueberriesCollected * blueberryTokenRate;

      const kiwiTokensRedeemable = kiwisRedeemable * kiwiTokenRate;
      const lemonTokensRedeemable = lemonsRedeemable * lemonTokenRate;
      const orangeTokensRedeemable = orangesRedeemable * orangeTokenRate;
      const appleTokensRedeemable = applesRedeemable * appleTokenRate;
      const blueberryTokensRedeemable = blueberriesRedeemable * blueberryTokenRate;

      // Calculate total tokens
      const totalTokens = kiwiTokens + lemonTokens + orangeTokens + appleTokens + blueberryTokens;
      const totalRedeemableTokens = kiwiTokensRedeemable + lemonTokensRedeemable + 
      orangeTokensRedeemable + appleTokensRedeemable + blueberryTokensRedeemable;
      userData.totalTokens = totalTokens;
      userData.totalRedeemableTokens = totalRedeemableTokens

      userData.totalKudos = totalKudos;
      console.log(userData)
    
    res.status(200).json({ userData });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
} 