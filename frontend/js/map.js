/* =========================================================
   CIVICSENSE — ISSUE MAP
   Standalone Map Page
   ========================================================= */

const API_BASE_URL = "http://127.0.0.1:8080";

let civicMap = null;
let civicMapMarkers = [];
let userLocationMarker = null;


/* =========================================================
   HELPERS
   ========================================================= */

function getCurrentUser() {

    const savedUser =
        localStorage.getItem("civicSenseUser");

    if (!savedUser) {
        return null;
    }

    try {
        return JSON.parse(savedUser);
    } catch (error) {

        console.error(
            "Invalid stored user:",
            error
        );

        localStorage.removeItem(
            "civicSenseUser"
        );

        return null;
    }
}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "CivicSense Issue Map loading..."
        );

        const user =
            getCurrentUser();

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        initializeUser(user);

        initializeLogout();

        initializeMap();

        initializeRefreshButton();

        initializeLocationButton();

    }
);


/* =========================================================
   USER
   ========================================================= */

function initializeUser(user) {

    const name =
        user.name || "Citizen";


    setText(
        "userName",
        name
    );


    const initial =
        name
            .trim()
            .charAt(0)
            .toUpperCase();


    setText(
        "userInitial",
        initial || "C"
    );
}


/* =========================================================
   LOGOUT
   ========================================================= */

function initializeLogout() {

    const button =
        document.getElementById(
            "logoutButton"
        );

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async () => {

            button.disabled = true;

            try {

                await fetch(
                    `${API_BASE_URL}/api/auth/logout`,
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            } finally {

                localStorage.removeItem(
                    "civicSenseUser"
                );

                window.location.href =
                    "login.html";
            }

        }
    );
}


/* =========================================================
   MAP INITIALIZATION
   ========================================================= */

function initializeMap() {

    const mapElement =
        document.getElementById(
            "civicMap"
        );


    if (!mapElement) {

        console.error(
            "civicMap element not found."
        );

        return;
    }


    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet is not loaded."
        );

        return;
    }


    civicMap =
        L.map(
            "civicMap",
            {
                center: [
                    17.3850,
                    78.4867
                ],

                zoom: 12,

                zoomControl: true,

                scrollWheelZoom: true,

                attributionControl: true
            }
        );


    /* -----------------------------------------------------
       OPEN STREET MAP
       ----------------------------------------------------- */

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            minZoom: 5,

            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(civicMap);


    console.log(
        "CivicSense Issue Map initialized."
    );

    // TEMP DEBUG
    civicMap.on("moveend", () => {
        console.log(
            ">>> MAP MOVEEND:",
            civicMap.getCenter(),
            "ZOOM:",
            civicMap.getZoom()
        );
    });

    console.log(
        ">>> INITIAL MAP:",
        civicMap.getCenter(),
        civicMap.getZoom()
    );

    // DEBUG: detect every map movement
    civicMap.on("moveend", () => {
        console.log(
            "MAP MOVED:",
            civicMap.getCenter(),
            "ZOOM:",
            civicMap.getZoom(),
            "STACK:",
            new Error().stack
        );
    });


    /* -----------------------------------------------------
       MAP SIZE
       ----------------------------------------------------- */

    setTimeout(
        () => {

            if (civicMap) {

                civicMap.invalidateSize(
                    true
                );

            }

        },
        150
    );


    setTimeout(
        () => {

            if (civicMap) {

                civicMap.invalidateSize(
                    true
                );

            }

        },
        700
    );


    /* -----------------------------------------------------
       LOAD ISSUES
       ----------------------------------------------------- */

    loadMapComplaints();
}


/* =========================================================
   LOAD COMPLAINTS
   ========================================================= */

async function loadMapComplaints() {

    if (!civicMap) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/complaints`,
                {
                    method: "GET",

                    credentials: "include"
                }
            );


        if (response.status === 401) {

            localStorage.removeItem(
                "civicSenseUser"
            );

            window.location.href =
                "login.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                `Map request failed (${response.status})`
            );
        }


        const complaints =
            await response.json();

        console.log("ALL COMPLAINT COORDINATES:");

        complaints.forEach(c => {
            console.log(
                "ID:", c.id,
                "TITLE:", c.title,
                "LAT:", c.latitude,
                "LNG:", c.longitude
            );
        });

        console.log(
            "Issue Map complaints:",
            complaints
        );


        clearMarkers();


        if (
            !Array.isArray(complaints)
        ) {

            updateStatistics([]);

            return;
        }


        const validPoints = [];

complaints.forEach(complaint => {

    const rawLatitude = complaint.latitude;
    const rawLongitude = complaint.longitude;

    // Reject missing coordinates
    if (
        rawLatitude === null ||
        rawLatitude === undefined ||
        rawLatitude === "" ||
        rawLongitude === null ||
        rawLongitude === undefined ||
        rawLongitude === ""
    ) {
        console.warn(
            "Skipping complaint without coordinates:",
            complaint.id,
            complaint.title
        );

        return;
    }

    const latitude = Number(rawLatitude);
    const longitude = Number(rawLongitude);

    // Reject invalid numbers
    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        console.warn(
            "Skipping complaint with invalid coordinates:",
            complaint.id,
            complaint.title,
            rawLatitude,
            rawLongitude
        );

        return;
    }

    // Reject impossible geographic coordinates
    if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        console.warn(
            "Skipping complaint with out-of-range coordinates:",
            complaint.id,
            complaint.title,
            latitude,
            longitude
        );

        return;
    }

    // IMPORTANT:
    // Never create a marker for [0, 0].
    if (
        latitude === 0 &&
        longitude === 0
    ) {
        console.warn(
            "Skipping [0,0] coordinate:",
            complaint.id,
            complaint.title
        );

        return;
    }

    const point = [
        latitude,
        longitude
    ];

    // Add only genuine geographic points
    validPoints.push(point);

    // Create marker only after validation
    createComplaintMarker(
        complaint,
        point
    );

});

    updateStatistics(
        complaints
    );


        /* -------------------------------------------------
           MAP VIEW

           We deliberately keep Hyderabad as the default
           when there are no coordinates.

           This avoids the map jumping to an unexpected
           location.
           ------------------------------------------------- */

       /* =========================================================
   MAP VIEW
   ========================================================= */

console.log(
    "VALID MAP POINTS:",
    validPoints.length,
    validPoints
);

/*
 * MAP VIEW
 *
 * Only use complaint coordinates that are close
 * enough to the main complaint cluster.
 *
 * This prevents old/default Hyderabad coordinates
 * from pulling the map away from the actual issue area.
 */

const MAIN_MAP_CENTER = [17.35745, 78.55590];

const nearbyPoints = validPoints.filter(point => {

    const latDiff =
        Math.abs(point[0] - MAIN_MAP_CENTER[0]);

    const lngDiff =
        Math.abs(point[1] - MAIN_MAP_CENTER[1]);

    return (
        latDiff <= 0.01 &&
        lngDiff <= 0.01
    );
});

console.log(
    "NEARBY MAP POINTS:",
    nearbyPoints.length,
    nearbyPoints
);

if (nearbyPoints.length === 1) {

    civicMap.setView(
        nearbyPoints[0],
        16,
        {
            animate: false
        }
    );

} else if (nearbyPoints.length > 1) {

    const bounds =
        L.latLngBounds(nearbyPoints);

    console.log(
        "NEARBY MAP BOUNDS:",
        bounds.getSouthWest(),
        bounds.getNorthEast()
    );

    civicMap.fitBounds(
        bounds,
        {
            padding: [40, 40],
            maxZoom: 16,
            animate: false
        }
    );

} else {

    console.log(
        "NO NEARBY POINTS — USING HYDERABAD"
    );

    civicMap.setView(
        [17.3850, 78.4867],
        12,
        {
            animate: false
        }
    );
}

        setTimeout(
            () => {

                if (civicMap) {

                    civicMap.invalidateSize(
                        true
                    );

                }

            },
            250
        );


    } catch (error) {

        console.error(
            "Issue Map loading error:",
            error
        );

    }
}


/* =========================================================
   CREATE MARKER
   ========================================================= */

function createComplaintMarker(
    complaint,
    point
) {

    const status =
        String(
            complaint.status ||
            "PENDING"
        ).toUpperCase();


    let markerColor =
        "#f59e0b";

    let statusText =
        "Pending";


    if (
        status === "IN_PROGRESS"
    ) {

        markerColor =
            "#7c3aed";

        statusText =
            "In Progress";
    }


    if (
        status === "RESOLVED"
    ) {

        markerColor =
            "#16a34a";

        statusText =
            "Resolved";
    }


    if (
        status === "CRITICAL"
    ) {

        markerColor =
            "#dc2626";

        statusText =
            "Critical";
    }


    const marker =
        L.circleMarker(
            point,
            {
                radius: 9,

                fillColor:
                    markerColor,

                color:
                    "#ffffff",

                weight: 3,

                opacity: 1,

                fillOpacity: 0.9
            }
        );


    const id =
        escapeHtml(
            complaint.id || "-"
        );


    const title =
        escapeHtml(
            complaint.title ||
            "Civic Issue"
        );


    const category =
        escapeHtml(
            complaint.category ||
            "General"
        );


    const location =
        escapeHtml(
            complaint.location ||
            "Location not provided"
        );


    const priority =
        escapeHtml(
            complaint.priority ||
            "MEDIUM"
        );


    const description =
        escapeHtml(
            complaint.description ||
            "No description available."
        );


    marker.bindPopup(`
        <div class="civic-map-popup">

            <div class="map-popup-id">
                #${id}
            </div>

            <h3>
                ${title}
            </h3>

            <div class="map-popup-row">
                <strong>Category</strong>
                <span>
                    ${category}
                </span>
            </div>

            <div class="map-popup-row">
                <strong>Location</strong>
                <span>
                    ${location}
                </span>
            </div>

            <div class="map-popup-row">
                <strong>Priority</strong>
                <span>
                    ${priority}
                </span>
            </div>

            <div class="map-popup-description">
                ${description}
            </div>

            <div
                class="map-popup-status"
                style="
                    border-color:${markerColor};
                    color:${markerColor};
                "
            >
                ${statusText}
            </div>

        </div>
    `);


    marker.addTo(
        civicMap
    );


    civicMapMarkers.push(
        marker
    );
}


/* =========================================================
   CLEAR MARKERS
   ========================================================= */

function clearMarkers() {

    civicMapMarkers.forEach(
        marker => {

            if (civicMap) {

                civicMap.removeLayer(
                    marker
                );

            }

        }
    );


    civicMapMarkers = [];
}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics(
    complaints
) {

    if (
        !Array.isArray(
            complaints
        )
    ) {

        complaints = [];
    }


    let pending = 0;

    let inProgress = 0;

    let resolved = 0;


    complaints.forEach(
        complaint => {

            const status =
                String(
                    complaint.status ||
                    "PENDING"
                ).toUpperCase();


            if (
                status === "PENDING"
            ) {

                pending++;

            } else if (
                status === "IN_PROGRESS"
            ) {

                inProgress++;

            } else if (
                status === "RESOLVED"
            ) {

                resolved++;

            }

        }
    );


    setText(
        "mapTotalIssues",
        complaints.length
    );


    setText(
        "mapPendingIssues",
        pending
    );


    setText(
        "mapProgressIssues",
        inProgress
    );


    setText(
        "mapResolvedIssues",
        resolved
    );
}


/* =========================================================
   REFRESH
   ========================================================= */

function initializeRefreshButton() {

    const button =
        document.getElementById(
            "refreshMapButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async () => {

            if (button.disabled) {
                return;
            }


            const originalText =
                button.textContent;


            button.disabled = true;

            button.textContent =
                "↻ Loading...";


            try {

                await loadMapComplaints();

            } finally {

                button.disabled = false;

                button.textContent =
                    originalText;
            }

        }
    );
}


/* =========================================================
   DETECT LOCATION
   ========================================================= */

function initializeLocationButton() {

    const button =
        document.getElementById(
            "detectMapLocation"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            if (
                !navigator.geolocation
            ) {

                alert(
                    "Geolocation is not supported by this browser."
                );

                return;
            }


            button.disabled = true;

            const originalText =
                button.textContent;


            button.textContent =
                "◎ Detecting...";


            navigator.geolocation.getCurrentPosition(

                position => {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    if (civicMap) {

                        civicMap.setView(
                            [
                                latitude,
                                longitude
                            ],
                            15,
                            {
                                animate: true
                            }
                        );


                        if (
                            userLocationMarker
                        ) {

                            civicMap.removeLayer(
                                userLocationMarker
                            );
                        }


                        userLocationMarker =
                            L.circleMarker(
                                [
                                    latitude,
                                    longitude
                                ],
                                {
                                    radius: 8,

                                    fillColor:
                                        "#15803d",

                                    color:
                                        "#ffffff",

                                    weight: 3,

                                    fillOpacity:
                                        1
                                }
                            );


                        userLocationMarker
                            .bindPopup(
                                "Your current location"
                            )
                            .addTo(
                                civicMap
                            );

                    }


                    button.disabled = false;

                    button.textContent =
                        originalText;

                },

                error => {

                    console.error(
                        "Geolocation error:",
                        error
                    );


                    alert(
                        "Unable to detect your location. Please allow location access."
                    );


                    button.disabled = false;

                    button.textContent =
                        originalText;

                },

                {
                    enableHighAccuracy: true,

                    timeout: 10000,

                    maximumAge: 0
                }
            );

        }
    );
}


/* =========================================================
   BROWSER RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (civicMap) {

            civicMap.invalidateSize(
                true
            );

        }

    }
);
