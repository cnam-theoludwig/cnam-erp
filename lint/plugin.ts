import { areaImportApi } from "./rules/areaImportApi.ts"
import { areaImportWeb } from "./rules/areaImportWeb.ts"
import { entityIdReference } from "./rules/entityIdReference.ts"
import { formNoValidate } from "./rules/formNoValidate.ts"
import { mutationAsyncHandler } from "./rules/mutationAsyncHandler.ts"
import { noBooleanUseState } from "./rules/noBooleanUseState.ts"
import { noClassNameConstant } from "./rules/noClassNameConstant.ts"
import { noRandomUuid } from "./rules/noRandomUuid.ts"
import { preferSharedUtils } from "./rules/preferSharedUtils.ts"
import { reactFCProps } from "./rules/reactFCProps.ts"
import { throwErrorInline } from "./rules/throwErrorInline.ts"
import { zodCoerceGeneric } from "./rules/zodCoerceGeneric.ts"
import { zodDefaultCatch } from "./rules/zodDefaultCatch.ts"
import { zodEmptyStringNull } from "./rules/zodEmptyStringNull.ts"
import { zodObjectNaming } from "./rules/zodObjectNaming.ts"
import { zodObjectType } from "./rules/zodObjectType.ts"
import { zodTypeName } from "./rules/zodTypeName.ts"

const repoPlugin = {
  meta: { name: "repo" },
  rules: {
    "area-import-api": areaImportApi,
    "area-import-web": areaImportWeb,
    "entity-id-reference": entityIdReference,
    "form-no-validate": formNoValidate,
    "mutation-async-handler": mutationAsyncHandler,
    "no-boolean-use-state": noBooleanUseState,
    "no-class-name-constant": noClassNameConstant,
    "no-random-uuid": noRandomUuid,
    "prefer-shared-utils": preferSharedUtils,
    "react-fc-props": reactFCProps,
    "throw-error-inline": throwErrorInline,
    "zod-coerce-generic": zodCoerceGeneric,
    "zod-default-catch": zodDefaultCatch,
    "zod-empty-string-null": zodEmptyStringNull,
    "zod-object-naming": zodObjectNaming,
    "zod-object-type": zodObjectType,
    "zod-type-name": zodTypeName,
  },
}

export default repoPlugin
