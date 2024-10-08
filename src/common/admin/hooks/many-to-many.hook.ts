import {ActionRequest, RecordActionResponse, ResourceOptions} from "adminjs";

import {CustomResource} from "../admin.resource.js";
import {Components} from "../components/components.js";
import pkg from "flat";
import logger from "../../../logger.js";

const {unflatten} = pkg;

//Role
const setResponseItems = async (
    context,
    response,
    reference: CustomResource,
) => {
    const {_admin, resource, record} = context;
    const toResource = reference;
    // const toResource = _admin.resources.find(resource: CustomResource => resource.getPropertyByKey() )
    const options = {order: [toResource.titleField()]};
    const throughItems = await resource.findRelated(record, reference, options);
    const items = toResource.wrapObjects(throughItems);
    if (items.length !== 0) {
        const primaryKeyField = toResource.primaryKeyField();
        logger.info(
            "🚀 ~ file: many-to-many.hook.ts:20 ~ primaryKeyField",
            primaryKeyField,
        );
        // response.record.populated[reference] = items;
        // response.record.params[reference] = items.map(
        //   (v) => v.params[primaryKeyField || 'id'],
        // );
    }
};

export const after = async (
    response: RecordActionResponse,
    request: ActionRequest,
    context: any,
) => {
    if (request && request.method) {
        const manyProperties = context.resource.getManyProperties();
        const manyReferences = context.resource.getManyReferences();
        const {record, _admin} = context;
        // logger.info( '🚀 ~ file: many-to-many.hook.ts:34 ~ _admin',
        //   _admin.resources,
        // );
        const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) {
                        return;
                    }
                    seen.add(value);
                }
                return value;
            };
        };
        // const resource = JSON.stringify(
        //   _admin.resources[1]._decorated,
        //   getCircularReplacer(),
        //   2,
        // );
        // const resource = _admin.resources[1];
        // const resource = context.resource.getManyReferences();
        // logger.info(
        //   '🚀 ~ file: many-to-many.hook.ts:36 ~ _admin.resources.forEach ~ data',
        //   resource,
        // );

        // _admin.resources.forEach((resource: any) => {
        //   const data = resource;
        //   logger.info(
        //     '🚀 ~ file: many-to-many.hook.ts:36 ~ _admin.resources.forEach ~ data',
        //     data,
        //   );
        // });
        // const toResource = _admin.resources.find(resource: CustomResource => resource.getPropertyByKey() )
        // logger.info(
        //   '🚀 ~ file: many-to-many.hook.ts:32 ~ _admin',
        //   _admin.resources,
        // );
        if (context.action.name == "edit" && request.method === "get") {
            // await Promise.all(
            //   manyReferences.map(async (reference: CustomResource) => {
            //     await setResponseItems(context, response, reference);
            //   }),
            // );
        }

        if (request.method === "post" && record.isValid()) {
            const params = unflatten(request.payload);
            await Promise.all(
                manyProperties.map(async (toResourceId: string) => {
                    const ids = params[toResourceId] || [];
                    await context.resource.saveRecords(record, toResourceId, ids);
                    // await context.resource.getRoles(record);
                }),
            );
        }
    }
    // if (request && request.method) {
    //   const manyProperties = context.resource.getManyProperties();
    //   if (context.action.name == 'edit' && request.method === 'get') {
    //     // Load all linked data
    //     await Promise.all(
    //       manyProperties.map(async (toResourceId) => {
    //         await setResponseItems(context, response, toResourceId);
    //       }),
    //     );
    //   }
    //   const { record } = context;
    //   if (request.method === 'post' && record.isValid()) {
    //     const params = unflatten(request.payload);
    // await Promise.all(
    //   manyProperties.map(async (toResourceId) => {
    //     const ids = params[toResourceId]
    //       ? params[toResourceId].map((v) => parseInt(v))
    //       : [];
    //     await context.resource.saveRecords(record, toResourceId, ids);
    //   }),
    // );
    //   }
    // }
    return response;
};

export const manyToManyComponent = (reference: string) => ({
    isVisible: {
        list: true,
        show: true,
        filter: true,
        edit: true,
    },
    isArray: true,
    reference: reference,
    components: {
        show: Components.ManyToManyShow,
        edit: Components.ManyToManyEdit,
        list: Components.ManyToManyList,
    },
});

export const injectManyToManySupport = (
    options: ResourceOptions,
    properties: { propertyName: string; modelClassName: string }[],
): ResourceOptions => {
    properties.forEach((propForSupport) => {
        options.properties[propForSupport.propertyName] = manyToManyComponent(
            propForSupport.modelClassName,
        );
        options.actions.new.after = [after];
        options.actions.edit.after = [after];
    });
    return options;
};
