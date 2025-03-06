import {
	bigint,
	bigserial,
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
	uniqueIndex
} from "drizzle-orm/pg-core"
import {relations, type SQL, sql} from "drizzle-orm"

export const bookingState = pgEnum("bookingState", ['pending', 'confirmed', 'canceled'])
export const roles = pgEnum("roles", ['ADMIN', 'OPERATOR', 'SUPEROPERATOR'])


export const clients = pgTable("clients", {
	id: serial().primaryKey().notNull(),
	lastName: text(),
	firstName: text(),
	middleName: text(),
	passportNumber: text(),
	passportIssuedBy: text(),
	passportIssuedAt: text(),
	phoneNumber: text().notNull(),
}, (table) => [
	unique("clients_phoneNumber_key").on(table.phoneNumber),
]);

export const offices = pgTable("offices", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	address: text().notNull(),
	actualAddress: text(),
	licenceNumber: text(),
	legalEntity: text(),
	credentials: text(),
	signatory: text(),
	signatoryGenitive: text(),
	signatoryStatus: text(),
	signatoryStatusGenitive: text(),
	attorneyNumber: text(),
	lastContractNumber: integer().notNull().default(1),

});

export const booking = pgTable("booking", {
	id: serial().primaryKey().notNull(),
	scheduleId: integer().notNull(),
	createdBy: integer().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	state: bookingState().notNull(),
	clientId: integer().notNull(),
	visitedAt : timestamp({ mode: 'string' }),
	serviceId: integer().notNull()
}, (table) => [
	uniqueIndex("unique_scheduleid_except_canceled").using("btree", table.scheduleId.asc().nullsLast().op("int4_ops")).where(sql`(state <> 'canceled'::"bookingState")`),
]);


export const service = pgTable("service", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	basePrice: integer().notNull(),
	documents: text().array().notNull(),
})



export const bookingRelations = relations(booking, ({ one }) => ({
	service: one(service, {
		fields: [booking.serviceId],
		references: [service.id]
	})
}))


export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	login: text().notNull(),
	password: text().notNull(),
	isActive: boolean().default(true).notNull(),
	session: text().notNull(),
	roles: text().array().notNull(),
	deleted: boolean().default(false).notNull(),
}, (table) => [
	unique("users_login_key").on(table.login),
]);

export const log = pgTable("log", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint({ mode: "number" }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	action: text().notNull(),
}, (table) => [
	index("idx_action_trgm").using("gin", table.action.asc().nullsLast().op("gin_trgm_ops")),
]);

export const schedule = pgTable("schedule", {
	id: serial().primaryKey().notNull(),
	date: text().notNull(),
	startTime: text().notNull(),
	endTime: text().notNull(),
	duration: integer().notNull(),
	officeId: integer().notNull(),
	year: integer('year').generatedAlwaysAs(
			(): SQL => sql`CAST(SUBSTRING(${schedule.date} FROM 1 FOR 4) AS INTEGER)`),
	month: integer('month').generatedAlwaysAs(
			(): SQL => sql`CAST(SUBSTRING(${schedule.date} FROM 6 FOR 2) AS INTEGER)`),

}, (table) => [
	index("office_date_idx").using("btree", table.officeId.asc().nullsLast().op("int4_ops"), table.date.asc().nullsLast()),
	unique("unique_sched").on(table.date, table.startTime, table.officeId),
]);


export const document = pgTable("documents", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	content: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});


export const settings = pgTable("settings", {
	key: text().primaryKey().notNull(),
	value: text().notNull()
});
