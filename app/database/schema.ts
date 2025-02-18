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
import {sql} from "drizzle-orm"

export const bookingState = pgEnum("bookingState", ['pending', 'confirmed', 'canceled'])
export const roles = pgEnum("roles", ['ADMIN', 'OPERATOR'])


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
	signatoryStatus: text(),
	attorneyNumber: text(),

});

export const booking = pgTable("booking", {
	id: serial().primaryKey().notNull(),
	scheduleId: integer().notNull(),
	createdBy: integer().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	state: bookingState().notNull(),
	clientId: integer().notNull(),
}, (table) => [
	uniqueIndex("unique_scheduleid_except_canceled").using("btree", table.scheduleId.asc().nullsLast().op("int4_ops")).where(sql`(state <> 'canceled'::"bookingState")`),
]);

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
}, (table) => [
	index("office_date_idx").using("btree", table.officeId.asc().nullsLast().op("int4_ops"), table.date.asc().nullsLast()),
	unique("unique_sched").on(table.date, table.startTime, table.officeId),
]);
