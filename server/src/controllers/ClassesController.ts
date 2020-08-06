import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';
import { Request, Response } from 'express';

export default class ClasseController {
    async index(request: Request, response: Response) {
        const filters = request.query;

        var subject = filters.subject as string;
        var week_day = filters.week_day as string;
        var time = filters.time as string;

        if (!filters.week_day || !filters.subject || !filters.time) {
            return response.status(400).json({
                error: "Faltando os filtros para procurar as classes"
            });
        }

        const timeInMinutes = convertHourToMinutes(time);

        const classes = await db('classes')
        .whereExists(function() {
            this.select('class_schedule.*')
            .from('class_schedule')
            .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
            .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
            .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
            .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes]);

        })
        .where('classes.subject', "=", subject)
        .join('users', "classes.user_id", "=", "users.id")
        .select("classes.*", "users.*");


        response.json(classes);
    }

    async create(request: Request, response: Response) {
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            scredule
        } = request.body;

        const trx = await db.transaction();

        try {
            const insertUsersIds = await trx('users').insert({
                name,
                avatar,
                whatsapp,
                bio
            });

            const user_id = insertUsersIds[0];

            const insertedCLasesId = await trx('classes').insert({
                subject,
                cost,
                user_id
            });

            const class_id = insertedCLasesId[0];

            const classScredule = scredule.map((screduleItem: ScreduleItem) => {
                return {
                    class_id,
                    week_day: screduleItem.week_day,
                    from: convertHourToMinutes(screduleItem.from),
                    to: convertHourToMinutes(screduleItem.to)
                }
            });

            await trx('class_schedule').insert(classScredule);

            trx.commit();
            return response.status(201).send();
        }
        catch (error) {
            console.log(error);
            trx.rollback();
            return response.status(400).json(
                "Erro inexperado ao criar uma classe."
            );
        }

    }
}