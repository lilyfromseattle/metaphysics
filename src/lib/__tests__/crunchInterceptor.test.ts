/* eslint-disable promise/always-return */
import request from "supertest"
import { crunch } from "graphql-crunch"
import { app, invokeError } from "../../test/gql-server"
import { mockInterceptor } from "../../test/interceptor"

import crunchInterceptor, { interceptorCallback } from "../crunchInterceptor"

const fakeCrunch = intercept =>
  mockInterceptor(interceptorCallback, {
    intercept,
  })

describe("crunchInterceptor", () => {
  it("should pass the result through unchanged when no param is present", () => {
    const intercept = jest.fn()
    return request(app(fakeCrunch(intercept)))
      .get("/?query={greeting}")
      .set("Accept", "application/json")
      .expect(200)
      .then(res => {
        expect(res.headers).not.toHaveProperty("X-Crunch")
        expect(intercept).not.toHaveBeenCalled()
      })
  })

  it("should crunch the result when param is present", () => {
    return request(app(crunchInterceptor))
      .get("/?query={greeting}&crunch")
      .set("Accept", "application/json")
      .expect(200)
      .expect("X-Crunch", "true")
      .then(res => {
        expect(res.body).toMatchObject(
          crunch({ data: { greeting: "Hello World" } })
        )
      })
  })

  it("should crunch the result when header is present", () => {
    return request(app(crunchInterceptor))
      .get("/?query={greeting}")
      .set("Accept", "application/json")
      .set("X-Crunch", true)
      .expect(200)
      .expect("X-Crunch", "true")
      .then(res => {
        expect(res.body).toMatchObject(
          crunch({ data: { greeting: "Hello World" } })
        )
      })
  })

  it("should not try to crunch on an error", () => {
    const intercept = jest.fn()
    return request(app(invokeError(404), fakeCrunch(intercept)))
      .get("/?query={greeting}&crunch")
      .set("Accept", "application/json")
      .expect(404)
      .then(res => {
        expect(res.headers).not.toHaveProperty("X-Crunch")
        expect(intercept).not.toHaveBeenCalled()
      })
  })
})
