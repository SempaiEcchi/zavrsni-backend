// students that employeer swiped
// @Entity()
// @Index(["job_id", "id", "swipe_direction", "student_id"], { unique: true })
// export class SwipedStudentsEntity extends BaseEntity {
//   @PrimaryGeneratedColumn("increment")
//   id: number;
//
//   @Column("timestamp with time zone", {
//     nullable: false,
//     default: () => "CURRENT_TIMESTAMP",
//   })
//   created_at: Date;
//
//   @ManyToOne(() => CompanyEntity, { eager: false })
//   @JoinColumn({ name: "company_id" })
//   company: CompanyEntity;
//   @Column()
//   company_id: number;
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
//   @JoinColumn({ name: "job_id" })
//   job_opportunity: JobOpportunityEntity;
//
//   @Column()
//   job_id: number;
//
//   @Column({
//     type: "enum",
//     enum: SwipeDirection,
//   })
//   swipe_direction: SwipeDirection;
// }
