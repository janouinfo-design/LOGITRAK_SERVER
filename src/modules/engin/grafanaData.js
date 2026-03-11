let DASHBOARD_INFOS = [
    {
        title: "Fréquence de visite chez le client",
        query: {
            "queries": [
                {
                    "refId": "A",
                    "datasource": {
                        "uid": "YEcYsr0Nk",
                        "type": "mssql"
                    },
                    "rawSql": "DECLARE @datefrom DATE = NULL;\r\nDECLARE @dateto DATE = NULL;\r\n\r\n-- Définir la période par défaut (les 15 derniers jours si rien n'est fourni)\r\nSET @datefrom = ISNULL(@datefrom, DATEADD(DAY, -15, CAST(GETDATE() AS DATE)));\r\nSET @dateto = ISNULL(@dateto, CAST(GETDATE() AS DATE));\r\n\r\n-- Vérification de la cohérence des dates\r\nIF (CAST(@dateto AS DATE) < CAST(@datefrom AS DATE))\r\nBEGIN\r\n    RAISERROR('La date de début doit être inférieure à la date de fin', 16, 1);\r\nEND;\r\n\r\n-- Requête principale avec filtrage sur la période\r\nSELECT \r\n    w.uid,\r\n    w.label,\r\n    ISNULL(COUNT(s.srcId), 0) AS VisitFrequency\r\nFROM worksite w\r\nINNER JOIN sat s\r\n    ON w.uid = s.srcLocationId\r\n    AND s.status = 26\r\n    AND s.satDate BETWEEN @datefrom AND @dateto\r\nGROUP BY w.uid, w.label\r\nORDER BY VisitFrequency DESC;\r\n",
                    "format": "table",
                    "datasourceId": 5,
                    "intervalMs": 60000,
                    "maxDataPoints": 469
                }
            ],
            "range": {
                "raw": {
                    "from": "now-6h",
                    "to": "now"
                }
            },
           
        }
    },
    {
        title:"Durée moyenne de residence",
        query: {
            "queries": [
                {
                    "refId": "A",
                    "datasource": {
                        "uid": "YEcYsr0Nk",
                        "type": "mssql"
                    },
                    "rawSql": "WITH LastDeliveries AS (\r\n    SELECT *\r\n    FROM (\r\n        SELECT \r\n            s.*,\r\n            ROW_NUMBER() OVER (PARTITION BY s.srcLocationId ORDER BY s.satDate DESC) AS rn\r\n        FROM sat s\r\n        WHERE s.status = 26 AND s.srcLocationId IS NOT NULL\r\n    ) x\r\n    WHERE x.rn <= 5\r\n),\r\nDepartures AS (\r\n    SELECT \r\n        ld.srcId,\r\n        ld.srcLocationId,\r\n        ld.satDate AS StartTime,\r\n        MIN(s2.satDate) AS EndTime\r\n    FROM LastDeliveries ld\r\n    LEFT JOIN sat s2 \r\n        ON s2.srcId = ld.srcId AND s2.satDate > ld.satDate\r\n    GROUP BY ld.srcId, ld.srcLocationId, ld.satDate\r\n),\r\nDurations AS (\r\n    SELECT \r\n        d.srcLocationId,\r\n        DATEDIFF(MINUTE, StartTime, ISNULL(EndTime, GETDATE())) / 1440.0 AS DurationDays\r\n    FROM Departures d\r\n    WHERE DATEDIFF(MINUTE, StartTime, ISNULL(EndTime, GETDATE())) / 1440.0 > 1\r\n)\r\nSELECT \r\n    w.label AS Client,\r\n    ROUND(AVG(DurationDays), 2) AS DureeMoyenneResidenceJours\r\nFROM Durations d\r\nINNER JOIN worksite w ON d.srcLocationId = w.uid\r\nWHERE w.label IS NOT NULL AND w.label NOT LIKE '%ZONETEST%'\r\nGROUP BY w.label\r\nHAVING ROUND(AVG(DurationDays), 2) > 1\r\nORDER BY DureeMoyenneResidenceJours DESC;\r\n",
                    "format": "table",
                    "datasourceId": 5,
                    "intervalMs": 60000,
                    "maxDataPoints": 382
                }
            ],
            "range": {
                "raw": {
                    "from": "now-6h",
                    "to": "now"
                }
            },
           
        }
    },
    {
        title: "Taux de rotation",
        query: {
            "queries": [
                {
                    "refId": "A",
                    "datasource": {
                        "uid": "YEcYsr0Nk",
                        "type": "mssql"
                    },
                    "rawSql": "WITH LastDeliveries AS (\r\n    SELECT *\r\n    FROM (\r\n        SELECT \r\n            s.*,\r\n            ROW_NUMBER() OVER (PARTITION BY s.srcLocationId ORDER BY s.satDate DESC) AS rn\r\n        FROM sat s\r\n        WHERE s.status = 26 AND s.srcLocationId IS NOT NULL\r\n    ) x\r\n    WHERE x.rn <= 5\r\n),\r\nReturned AS (\r\n    SELECT \r\n        srcId, \r\n        MIN(satDate) AS ReturnedDate\r\n    FROM sat\r\n    WHERE status = 27 -- statut de retour\r\n    GROUP BY srcId\r\n),\r\nRotationCalc AS (\r\n    SELECT \r\n        w.label AS Client,\r\n        COUNT(ld.srcId) AS TotalDeliveries,\r\n        COUNT(CASE WHEN r.ReturnedDate > ld.satDate THEN 1 END) AS ReturnedEngins\r\n    FROM LastDeliveries ld\r\n    LEFT JOIN Returned r ON ld.srcId = r.srcId\r\n    INNER JOIN worksite w ON ld.srcLocationId = w.uid\r\n    WHERE w.label IS NOT NULL AND w.label NOT LIKE '%ZONETEST%'\r\n    GROUP BY w.label\r\n)\r\nSELECT \r\n    Client,\r\n    ROUND(CAST(ReturnedEngins AS FLOAT) / NULLIF(TotalDeliveries, 0), 2) AS TauxRotation\r\nFROM RotationCalc\r\nORDER BY TauxRotation DESC;\r\n",
                    "format": "table",
                    "datasourceId": 5,
                    "intervalMs": 60000,
                    "maxDataPoints": 382
                }
            ],
            "range": {
                "raw": {
                    "from": "now-6h",
                    "to": "now"
                }
            }
        }
    },
    {
        title: "Répartition des bouteilles par client",
        query: {
            "queries": [
                {
                    "refId": "A",
                    "datasource": {
                        "uid": "YEcYsr0Nk",
                        "type": "mssql"
                    },
                    "rawSql": "SELECT \r\n    w.label AS Client,\r\n    ISNULL(t.label, 'Sans famille') AS Famille,\r\n    COUNT(*) AS NombreBouteilles\r\nFROM Inventory i\r\nJOIN Engin e ON i.srcId = e.uid\r\nJOIN worksite w ON e.LocationID = w.uid\r\nLEFT JOIN TypeItems t ON e.typeid = t.uid\r\nWHERE i.sysactive = 1 AND i.src = 'engin'\r\nGROUP BY w.label, t.label\r\nORDER BY NombreBouteilles DESC;\r\n",
                    "format": "table",
                    "datasourceId": 5,
                    "intervalMs": 60000,
                    "maxDataPoints": 365
                }
            ],
            "range": {
                "raw": {
                    "from": "now-6h",
                    "to": "now"
                }
            }
        }
    }
]

let ENGIN_DASHBOARD_PROCS = [
    {
        code: "visit_frequency",
        label: "Fréquence de visite chez le client",
        title: "Fréquence de visite chez le client (en jour)",
        proc: "DASHBOARD_VISIT_FREQUENCY"
    },
    {
        code: "repartition",
        label: "Répartition des bouteilles par client",
        title: "Répartition des bouteilles par client (en jour)",
        proc: "DASHBOARD_ENGIN_PER_CLIENT"
    },
    {
        code: "residency",
        label: "Durée moyenne de residence",
        title: "Durée moyenne de residence (en jours)",
        proc: "DASHBOARD_RESIDENCE_TIME"
    },
    {
        code: "rotation",
        label: "Taux de rotation",
        proc: "DASHBOARD_ROTATION_RATE"
    }
]
module.exports = {
    DASHBOARD_INFOS,
    ENGIN_DASHBOARD_PROCS,
}