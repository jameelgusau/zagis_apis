import { db } from "../db";

export const getDashboardStatsService = async () => {
  const [
    accounts,
    files,
    collected,
    not_collected,
  ] = await Promise.all([
    db.Account.count(),
    db.File.count(),
    db.File.findAndCountAll({
      include: [{
        model: db.Record,
        where: {
          collected: "Yes"
        }
      }]
    }),
    db.File.findAndCountAll({
      include: [{
        model: db.Record,
        where: {
          collected: "No"
        }
      }]
    }),
    // db.Lga.count()
  ]);

  return {
    accounts, files, collected: collected.count,
    not_collected: not_collected.count,
  };
};


export const getDashboardGraphService = async () => {
  const { fn, col, literal } = db.sequelize;
  const data = await db.Record.findAll({
    attributes: [
      [fn("DATE", col("created_at")), "date"],
      [
        literal(`COUNT(CASE WHEN collected = 'Yes' THEN 1 END)`),
        "collected",
      ],
      [
        literal(`COUNT(CASE WHEN collected = 'No' THEN 1 END)`),
        "not_collected",
      ],
      [fn("COUNT", col("id")), "total"],
    ],
    group: [fn("DATE", col("created_at"))],
    order: [[fn("DATE", col("created_at")), "ASC"]],
    raw: true,
  });
  return data;
}