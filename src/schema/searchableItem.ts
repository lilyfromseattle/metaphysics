import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLNonNull,
} from "graphql"
import { toGlobalId } from "graphql-relay"
import { Searchable } from "schema/searchable"
import { NodeInterface, GravityIDFields } from "schema/object_identification"
import { ResolverContext } from "types/graphql"

const hrefFromAutosuggestResult = item => {
  if (item.href) return item.href
  switch (item.label) {
    case "Profile":
      return `/${item.id}`
    case "Fair":
      return `/${item.profile_id}`
    case "Sale":
      return `/auction/${item.id}`
    case "City":
      return `/shows/${item.id}`
    default:
      return `/${item.model}/${item.id}`
  }
}

export const SearchableItem = new GraphQLObjectType<any, ResolverContext>({
  name: "SearchableItem",
  interfaces: [NodeInterface, Searchable],
  fields: {
    ...GravityIDFields,
    __id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: item => toGlobalId("SearchableItem", item._id),
    },
    displayLabel: {
      type: GraphQLString,
      resolve: item => item.display,
    },
    imageUrl: {
      type: GraphQLString,
      resolve: item => item.image_url,
    },
    href: {
      type: GraphQLString,
      resolve: item => hrefFromAutosuggestResult(item),
    },
    searchableType: {
      type: GraphQLString,
      resolve: ({ label, owner_type }) => {
        switch (label) {
          case "Profile":
            const institutionTypes = [
              "PartnerInstitution",
              "PartnerInstitutionalSeller",
            ]
            if (institutionTypes.includes(owner_type)) {
              return "Institution"
            } else if (owner_type === "FairOrganizer") {
              return "Fair"
            } else {
              return "Gallery"
            }
          case "Gene":
            return "Category"

          // TODO: How do we correctly display Sale/Auction types?
          // There's nothing to distinguish the two types present
          // in the special `match` JSON returned from the Gravity API.
          case "Sale":
            return "Auction"

          case "MarketingCollection":
            return "Collection"

          default:
            return label
        }
      },
    },
  },
})
