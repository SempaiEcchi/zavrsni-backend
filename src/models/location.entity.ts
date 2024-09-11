import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from "typeorm";
import {Point} from "geojson";
import {StudentEntity} from "./students.entity.js";
import {LatLng} from "../common/ip2location.js";

@Entity()
export class LocationEntity extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;


    @OneToOne(() => StudentEntity, (student) => student.location,)
    @JoinColumn({name: "student_id"})
    student: Relation<StudentEntity>;

    @Column({nullable: false})
    student_id: number;


    @Index({spatial: true})
    @Column({
        type: "geography",
        spatialFeatureType: "Point",
        srid: 4326,
        nullable: true,
    })
    location: Point;

    @Column({default: ""})
    location_name: string;

    @UpdateDateColumn()
    updated_at: Date;

    latLng() {
        return new LatLng(this.location.coordinates[1], this.location.coordinates[0])
    }
}
