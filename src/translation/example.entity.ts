import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Translation } from "./translation.entity";

@Entity()
export class Example {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sentence: string;

  @ManyToOne(() => Translation, translation => translation.examples)
  translation: Translation;
}
