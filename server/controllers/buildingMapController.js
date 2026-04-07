const db = require('../db/connection');

function getBuildingMappings() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT name, abbr
      FROM BuildingMap
      WHERE abbr IS NOT NULL AND TRIM(abbr) <> ''
      ORDER BY abbr ASC;
    `;

    db.all(query, (err, rows) => {
      if (err) {
        return reject(err);
      }
      return resolve(rows);
    });
  });
}

exports.getBuildingMap = async (req, res) => {
  try {
    const rows = await getBuildingMappings();
    res.json(rows);
  } catch (err) {
    console.error('Error querying BuildingMap:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getBuildingAbbreviations = async (req, res) => {
  try {
    const rows = await getBuildingMappings();
    const abbreviations = [...new Set(rows.map((row) => row.abbr))];
    res.json(abbreviations);
  } catch (err) {
    console.error('Error querying BuildingMap abbreviations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
