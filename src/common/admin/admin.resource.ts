import {BaseRecord, BaseResource} from "adminjs";
import {Resource} from "@adminjs/typeorm";

export class CustomResource extends Resource {
    titleField() {
        return this.decorate().titleProperty().name();
    }

    wrapObjects(objects) {
        return objects.map(
            (sequelizeObject) => new BaseRecord(sequelizeObject.toJSON(), this),
        );
    }

    async findRelated(record, resource: CustomResource, options = {}) {
        // resource.find(
        //   {
        //     relations: true,
        //   },
        //   {},
        // );
        // const instance = this.getInstance(record);
        // const association = this.getAssociationsByResourceId(resource)[0];
        // return await instance[association.accessors.get](options);
    }

    async saveRecords(record, resourceId, ids: { id: string | number }[]) {
        await this.update(record.params.id, {
            [resourceId]: ids.map((value) => ({id: value.id})),
        });

        // const instance = this.getInstance(record);
        // const association = this.getAssociationsByResourceId(resourceId)[0];
        // await association.set(instance, ids);
    }

    primaryKeyField() {
        return this.id;
    }

    getManyReferences(): BaseResource[] {
        return this.decorate()
            .getProperties({where: "edit"})
            .filter((p: any) => {
                return p.type() === "reference";
            })
            .map((p) => p.reference());
    }

    getManyProperties() {
        return this.decorate()
            .getProperties({where: "edit"})
            .filter((p: any) => {
                return p.type() === "reference";
            })
            .map((p) => p.name());
    }
}
