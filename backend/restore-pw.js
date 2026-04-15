const mongoose = require('mongoose');
require('dotenv').config();

const data = [{
  '_id': '68dcd5f0ed4d75b77a67a03b',
  'password': '34621',
},
{
  '_id': '68dcd5f0ed4d75b77a67a03c',
  'password': 'Marthe21%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a03d',
  'password': 'Renatha21%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a03e',
  'password': 'Diane21%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a03f',
  'password': 'Clarisse21%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a040',
  'password': 'Leatitia21%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a041',
  'password': 'Angelique21%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a042',
  'password': 'Sandrine21%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a043',
  'password': 'Josue21%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a044',
  'password': 'Ruth221%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a045',
  'password': 'Aime221%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a046',
  'password': 'Eric221%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a047',
  'password': 'Marie21%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a048',
  'password': 'Rosine21%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a049',
  'password': 'Uwitije21%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a04a',
  'password': 'Shemsa21%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a04b',
  'password': 'Jeanne21%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a04c',
  'password': 'Emmanuel21%',
},
{
  '_id': '68dcd5f0ed4d75b77a67a04d',
  'password': '75321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a04e',
  'password': '85321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a04f',
  'password': '94321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a050',
  'password': '93129',
},
{
  '_id': '68dcd5f0ed4d75b77a67a051',
  'password': '95321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a052',
  'password': '94321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a053',
  'password': '86321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a054',
  'password': '97321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a055',
  'password': '87321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a056',
  'password': '64321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a057',
  'password': '87321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a058',
  'password': '97521',
},
{
  '_id': '68dcd5f0ed4d75b77a67a059',
  'password': '98321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a05a',
  'password': '96321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a05b',
  'password': '89721',
},
{
  '_id': '68dcd5f0ed4d75b77a67a05c',
  'password': '45821',
},
{
  '_id': '68dcd5f0ed4d75b77a67a05d',
  'password': '67821',
},
{
  '_id': '68dcd5f0ed4d75b77a67a05e',
  'password': '97521',
},
{
  '_id': '68dcd5f0ed4d75b77a67a05f',
  'password': '46521',
},
{
  '_id': '68dcd5f0ed4d75b77a67a060',
  'password': '76321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a061',
  'password': '64321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a062',
  'password': '87921',
},
{
  '_id': '68dcd5f0ed4d75b77a67a063',
  'password': '98521',
},
{
  '_id': '68dcd5f0ed4d75b77a67a064',
  'password': '89721',
},
{
  '_id': '68dcd5f0ed4d75b77a67a065',
  'password': '89321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a066',
  'password': '79321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a067',
  'password': '39721',
},
{
  '_id': '68dcd5f0ed4d75b77a67a068',
  'password': '48921',
},
{
  '_id': '68dcd5f0ed4d75b77a67a069',
  'password': '38921',
},
{
  '_id': '68dcd5f0ed4d75b77a67a06a',
  'password': '84321',
},
{
  '_id': '68dcd5f0ed4d75b77a67a06b',
  'password': '95421',
},
{
  '_id': '68dcd5f0ed4d75b77a67a06c',
  'password': '98521',
},
{
  '_id': '68dcd972a7344883fe741bff',
  'password': 'Moise21%',
},
{
  '_id': '68dcf093d75bb519e98dbc5c',
  'password': 'Regis21%',
},
{
  '_id': '68de598f549443b0ca9ed58f',
  'password': 'Daniel21%',
}
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  let updated = 0;
  for (const item of data) {
    const result = await mongoose.connection.collection('students').updateOne(
      { _id: new mongoose.Types.ObjectId(item._id) },
      { $set: { password: item.password } }
    );
    if (result.matchedCount > 0) updated++;
  }
  console.log('Successfully restored plaintext passwords for ' + updated + ' students!');
  process.exit(0);
}).catch((e) => { console.error(e); process.exit(1); });
