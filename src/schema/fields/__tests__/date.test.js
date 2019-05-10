import dateField, { date, isoDate } from "schema/fields/date"

describe("date", () => {
  const rawDate = "2020-12-31T12:00:00+00:00"
  const format = "M/D/YYYY h:mm Z"
  it("returns unformatted, UTC time if no timezone or format is specified", () => {
    expect(date(rawDate)).toBe("2020-12-31T12:00:00+00:00")
  })

  it("returns formatted UTC time if no timezone is specified", () => {
    expect(date(rawDate, format)).toBe("12/31/2020 12:00 +00:00")
  })

  it("returns unformatted, local time if no format is specified", () => {
    expect(date(rawDate, null, "America/Boise")).toBe(
      "2020-12-31T05:00:00-07:00"
    )
    expect(date(rawDate, null, "Pacific/Fiji")).toBe(
      "2021-01-01T01:00:00+13:00"
    )
  })

  it("provides formatted, local time if timezone and format are specified", () => {
    expect(date(rawDate, format, "America/Boise")).toBe(
      "12/31/2020 5:00 -07:00"
    )
    expect(date(rawDate, format, "Pacific/Fiji")).toBe("1/1/2021 1:00 +13:00")
  })

  it("works with YYYY-MM-DD format", () => {
    expect(date("1987-12-04", format, "Europe/London")).toMatchInlineSnapshot(
      `"12/4/1987 12:00 +00:00"`
    )

    // bad month
    expect(date("1987-14-04", format, "Europe/London")).toMatchInlineSnapshot(
      `"Invalid date"`
    )
  })

  it("preserves dates if not formatted", () => {
    expect(date("1987-04-12")).toMatchInlineSnapshot(`"1987-04-12"`)
  })
})

describe("dateField", () => {
  it("should return null for a missing date", () => {
    expect(
      dateField.resolve(
        { date: null },
        { timezone: "America/Boise" },
        {},
        { fieldName: "date" }
      )
    ).toBeNull()
  })
})
