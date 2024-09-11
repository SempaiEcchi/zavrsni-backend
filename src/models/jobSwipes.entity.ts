export enum SwipeDirection {
    DISLIKE = "DISLIKE",
    LIKE = "LIKE",
    SAVE = "SAVE",
}

// jobs that student swiped
// @Entity()
// export class SwipedJobsEntity extends BaseEntity {
//   @PrimaryGeneratedColumn("increment")
//   id: number;
//
//   @Column("timestamp with time zone", {
//     nullable: false,
//     default: () => "CURRENT_TIMESTAMP",
//   })
//   created_at: Date;
//
//   @Column({ default: false })
//   isFrozen: boolean;
//
//   @ManyToOne(() => StudentEntity, { eager: false })
//   @JoinColumn({ name: "student_id" })
//   student: StudentEntity;
//   @Column()
//   student_id: number;
//
//   @ManyToOne(() => JobOpportunityEntity, { eager: false })
//   @JoinColumn({ name: "id_job" })
//   job_opportunity: JobOpportunityEntity;
//
//   @Column()
//   id_job: number;
//
//   @Index()
//   @Column({
//     type: "enum",
//     enum: SwipeDirection,
//   })
//   swipe_direction: SwipeDirection;
// }
