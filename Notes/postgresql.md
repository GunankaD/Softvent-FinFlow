# Postgresql Notes
- Download postgresql from their website
- Then go ahead and install it. I have installed it in F:\ drive
- pgAdmin the GUI to connect to this server and then the SQL Shell (psql), the CLI to connect to psql server
- Both can be found using the search function of windows


## Connecting with CLI
```
Server [localhost]:  
Database [postgres]:  
Port [5432]:  
Username [postgres]:  
Password for user postgres: guna123
```
Press enter at each line, this will take the default value displayed inside square brackets. for the password, enter as displayed above and hit enter, this will take us to the psql cli and it will look something like this.
```
postgres=# 
```

## Architecture
`psql  →  PostgreSQL server  →  disk`   

1. **psql (CLI / client)**
    - this is where we type our commands in
    - program running on your machine
    - Just sends text commands
    - Has extra helpers → \l, \dt, \c
    - Does NOT store data
    - Think: keyboard + UI

2. **Connection layer**
    - TCP/IP (usually localhost:5432)
    - Auth (username + password)
    - If auth fails → nothing goes through

3. **PostgreSQL Server (the brain)**
    - Always running in background as a service
    - Parses SQL
    - Executes queries
    - Manages users, permissions, locks
    - This is the real database system

4. **Database files (disk)**
    - Actual data stored as files
    - On Windows usually something like:
    - C:\Program Files\PostgreSQL\18\data\
    - Tables, indexes, WAL logs — all here
    - You never touch these directly


## Basic Commands with psql
from how on, the CLI will be referred to as pqsl
```
postgres=# help
You are using psql, the command-line interface to PostgreSQL.
Type:  \copyright for distribution terms
       \h for help with SQL commands
       \? for help with psql commands
       \g or terminate with semicolon to execute query
       \q to quit
```
entering help will display the above backslash help commands.

### Important commands (Will be updated)
ALWAYS end sql commands with semicolon (;) otherwise it wont be executed  

1. `\l`
    - lists all the databases inside postgresql server
2. `CREATE DATABASE database-name;`
3. `\c database-name`
    - this connects to the database as mentioned. 
4. `DROP DATABASE database-name;`
    - cannot drop the currently connected db, have to exit.
5. `CREATE TABLE ( colname1 dtype1, colname2 dtype2... )`
	- the command wont be executed until we enter semicolon so we can hit enter for each line.
	- `test` is the name of the database
	```
		test=# CREATE TABLE person (
		test(# id BIGSERIAL NOT NULL PRIMARY KEY,
		test(# first_name VARCHAR(50) NOT NULL,
		test(# last_name VARCHAR(50) NOT NULL,
		test(# gender VARCHAR (6) NOT NULL,
		test(# date_of_birth DATE NOT NULL,
		test(# email VARCHAR(150) );
	```
6. `\d`
	- describes current database. ie displays all the tables
	- `\d tablename` describes the table ie displays all columns
7. `INSERT INTO person (...) VALUES (...)`
	- values need to follow the order of columns displayed after person
	```
		test=# INSERT INTO person (first_name, last_name, gender, date_of_birth)
		test-# VALUES ('Anne', 'Smith', 'FEMALE', date '1988-01-09');
		INSERT 0 1
	```
8. `\i X:/path/to/sql/file.sql`
	- this executes any sql file

## How data is stored in a disk
```
Disk
 └── Pages (8 KB each)
      └── Rows (tuples)
           └── Columns (numbers, text, etc.)
```
- Entire page is fetched at once
- Pages contain rows and each row looks like this:
```
[ row header ][ col1 ][ col2 ][ col3 ] ...
```
- Data is stored in columns sequentially in binary format

## Datatypes in SQL
1. **Numbers**
	- smallint 
	- integer / int 
	- bigint 
	- decimal / numeric
	- real
	- double precision
	- serial
	- bigserial

2. **Text / Strings**
	- char(n)
	- varchar(n)
	- text

3. **Boolean**
	- boolean (true / false)

4. **Date & Time**
	- date
	- time
	- timestamp
	- timestamp with time zone (timestamptz)
	- interval

5. **Binary / Raw**
	- bytea

6. **Arrays**
	- int[]
	- text[]
	- any_type[]
	- varchar[]
	- uuid[]

7. **Identifiers**
	- uuid

8. **JSON**
	- json
	- jsonb

9. **Network (PostgreSQL-specific)**
	- inet
	- cidr
	- macaddr

10. **Geometry / Special**
	- point
	- line
	- circle
	- polygon

11. **System / Meta**
	- oid
	- regclass


### char(n) vs varchar(n) vs text
- char(n): 
	- always takes n bytes + extra header space.
	- If the data stored in this dtype is lesser than n, then db pads out empty space.

- varchar(n):
	- If m bytes (m < n) is stored, then this column only occupies m bytes + extra header space. and succeeding columns start on m + 1 bytes and not n + bytes.
	- `n` is only an upperlimit and throws error if we try to store more than n bytes.
	- Now a question. What happens if I edit this value later on which increases the size? Does the db update this row and move the succeeding columns to the right? No. It creates a new row and appends it in the same page if space allows or in some other page. Does not touch the old rows! MVCC comes into play.

- text:
	- same as varchar but no upper limit n. 
	- can store how much ever required.


## What are headers?
1. **Column value header**
	- For variable-length types, Postgres stores: `[ length info ][ actual bytes ]`.
	- db needs to know where this value ends and where to start the next column
2. **Row header**
	- Row header stores: 
		- transaction IDs (who created it)
		- visibility info (MVCC)
		- flags (deleted, updated, etc.)
		- null bitmap (which columns are NULL)
	- this helps with concurrency, rollbacks and consistent reads
3. **Page header**
	- Page header stores:
		- page size
		- checksum
		- pointers to rows
		- free space info

#### Dummy data is available in mockaroo website