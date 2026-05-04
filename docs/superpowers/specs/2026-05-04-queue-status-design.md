# Queue Status Design

## Goal

Add optional queue information to each station report without increasing friction in the core fuel reporting flow.

Users should be able to tell the app whether there is a queue at a station and whether that queue is short or long. Fuel reporting remains the primary action.

## Product Rules

- Anyone can report queue information, including anonymous visitors.
- Queue information is optional.
- Saving a report still requires Gasoline and Diesel selections plus valid GPS proximity.
- Queue information does not block saving if left blank.
- Authenticated users can create stations.
- Only admins can remove stations.

## Public Queue States

The public queue state is calculated independently from fuel states.

Supported public states:

- `unknown`: Ainda sem informação do publico
- `none`: Sem fila
- `short`: Fila curta
- `long`: Fila longa
- `conflict`: Informação contraditoria

UI copy should avoid `A aguardar sinais` for queue. Queue has a different user expectation than fuel availability, so the empty state should read as missing public information, not as an instruction.

## Aggregation Logic

Use the same identity and recency principles already validated for fuel reports:

- count only the latest queue observation from each person
- use only observations from the last 3 hours
- anonymous visitors are identified by `cm_guest_reporter_key`
- authenticated users are identified by profile id

Resolution:

- fewer than 2 people with queue observations: `unknown`
- at least 2 people and a clear majority for one option: that option wins
- otherwise: `conflict`

Queue options ranked by meaning:

- `none`
- `short`
- `long`

## Data Model

Preferred implementation:

- extend `signals` with nullable `queue_status`
- create enum `queue_status_option` with values:
  - `none`
  - `short`
  - `long`
- create public enum/result type for aggregated status if useful:
  - `unknown`
  - `none`
  - `short`
  - `long`
  - `conflict`

Rationale:

- queue belongs to the same physical observation as fuel
- same GPS validation applies
- same recent-person aggregation model applies
- avoids a second reporting flow or table for launch

## API

`POST /api/signals` accepts optional queue data:

```json
{
  "stationId": "...",
  "updates": [
    { "fuelType": "gasoline", "option": "available" },
    { "fuelType": "diesel", "option": "unavailable" }
  ],
  "queueStatus": "short",
  "guestReporterKey": "...",
  "userLatitude": -25.9,
  "userLongitude": 32.5
}
```

If `queueStatus` is omitted or null, no queue observation is inserted.

To keep the data model simple, a queue observation can be represented as one additional signal row with `fuel_type` null only if the schema is changed accordingly. If that complicates existing fuel constraints, use a nullable `queue_status` column on each inserted fuel row and aggregate distinct report batches by reporter and timestamp.

Implementation must choose the least invasive version after inspecting the existing constraints.

## UI

In the station report form:

- keep Gasoline and Diesel as required
- add an optional section below them:
  - label: `Fila agora?`
  - choices:
    - `Não sei`
    - `Sem fila`
    - `Fila curta`
    - `Fila longa`
- default is `Não sei`
- the save button remains controlled by fuel selections and GPS only

In the station detail summary:

- show queue as a compact line near the fuel quick read:
  - `Fila: Sem fila`
  - `Fila: Fila curta`
  - `Fila: Fila longa`
  - `Fila: Informação contraditória`
  - `Fila: Ainda sem informação do publico`

In the map popup:

- include a short queue line only if it does not make the popup too dense
- recommended copy:
  - `Fila: Sem fila`

## Testing

Manual browser tests:

1. Save fuel report without queue information.
   - report saves
   - queue remains `Ainda sem informação do publico`

2. Two different browsers report `Sem fila`.
   - queue resolves to `Sem fila`

3. One browser reports `Sem fila`, another reports `Fila longa`.
   - queue resolves to `Informação contraditória`

4. One browser reports `Fila curta`, another reports `Fila longa`.
   - queue resolves according to majority rules; with 1 vs 1 it is conflict

5. Existing fuel aggregation remains unchanged.

## Out of Scope

- queue duration estimates
- exact number of cars
- photos
- admin moderation of queue reports
- queue-specific filters on the map
