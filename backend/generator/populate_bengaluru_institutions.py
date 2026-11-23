import json
import math
import os

INSTITUTIONS = [
    # --- UNIVERSITIES & COLLEGES ---
    {
        "zone_id": "BLR-COL-001",
        "name": "Indian Institute of Science (IISc)",
        "amenity": "university",
        "institution_type": "Premier Research & Science University",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "07:00 - 19:00 IST",
        "address": "CV Raman Road, Sadashivanagar",
        "lat": 13.0219,
        "lon": 77.5671,
        "radius_m": 420
    },
    {
        "zone_id": "BLR-COL-002",
        "name": "RV College of Engineering (RVCE)",
        "amenity": "college",
        "institution_type": "Autonomous Engineering College",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 17:30 IST",
        "address": "RV Vidyaniketan Post, Mysuru Road",
        "lat": 12.9237,
        "lon": 77.4987,
        "radius_m": 350
    },
    {
        "zone_id": "BLR-COL-003",
        "name": "PES University (RR Campus)",
        "amenity": "university",
        "institution_type": "Technical Deemed University",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 17:30 IST",
        "address": "100 Feet Ring Road, BSK 3rd Stage",
        "lat": 12.9344,
        "lon": 77.5345,
        "radius_m": 320
    },
    {
        "zone_id": "BLR-COL-004",
        "name": "BMS College of Engineering (BMSCE)",
        "amenity": "college",
        "institution_type": "Autonomous Engineering College",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 17:00 IST",
        "address": "Bull Temple Road, Basavanagudi",
        "lat": 12.9416,
        "lon": 77.5655,
        "radius_m": 280
    },
    {
        "zone_id": "BLR-COL-005",
        "name": "M.S. Ramaiah Institute of Technology (MSRIT)",
        "amenity": "college",
        "institution_type": "Autonomous Engineering Institute",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 17:30 IST",
        "address": "MSR Nagar, MSRIT Post, Mathikere",
        "lat": 13.0315,
        "lon": 77.5649,
        "radius_m": 300
    },
    {
        "zone_id": "BLR-COL-006",
        "name": "M.S. Ramaiah Medical College",
        "amenity": "college",
        "institution_type": "Medical College & Super Specialty Hospital",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "24/7 Zone (Hospital & College)",
        "address": "MSR Nagar, Mathikere",
        "lat": 13.0298,
        "lon": 77.5684,
        "radius_m": 280
    },
    {
        "zone_id": "BLR-COL-007",
        "name": "Christ University (Central Campus)",
        "amenity": "university",
        "institution_type": "Multidisciplinary Deemed University",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 18:00 IST",
        "address": "Hosur Road, Bhavani Nagar, SG Palya",
        "lat": 12.9342,
        "lon": 77.6062,
        "radius_m": 320
    },
    {
        "zone_id": "BLR-COL-008",
        "name": "St. Joseph's University",
        "amenity": "university",
        "institution_type": "Jesuit Private University",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 17:00 IST",
        "address": "36 Lalbagh Road / Langford Road, Shanthi Nagar",
        "lat": 12.9615,
        "lon": 77.5975,
        "radius_m": 240
    },
    {
        "zone_id": "BLR-COL-009",
        "name": "St. Joseph's College of Commerce",
        "amenity": "college",
        "institution_type": "Autonomous Commerce College",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "07:30 - 16:30 IST",
        "address": "163 Brigade Road, Ashok Nagar",
        "lat": 12.9719,
        "lon": 77.6074,
        "radius_m": 180
    },
    {
        "zone_id": "BLR-COL-010",
        "name": "Mount Carmel College (MCC)",
        "amenity": "college",
        "institution_type": "Autonomous Women's College",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 16:30 IST",
        "address": "58 Palace Road, Vasanth Nagar",
        "lat": 12.9902,
        "lon": 77.5898,
        "radius_m": 230
    },
    {
        "zone_id": "BLR-COL-011",
        "name": "Bangalore Medical College & Research Institute (BMCRI)",
        "amenity": "college",
        "institution_type": "Premier Government Medical College",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "24/7 Clinical & Academic Zone",
        "address": "Fort, KR Road, Kalasipalya",
        "lat": 12.9610,
        "lon": 77.5752,
        "radius_m": 300
    },
    {
        "zone_id": "BLR-COL-012",
        "name": "St. John's Medical College",
        "amenity": "college",
        "institution_type": "Medical College & Academy of Health Sciences",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "24/7 Hospital & Medical Campus",
        "address": "100 Feet Road, Koramangala",
        "lat": 12.9315,
        "lon": 77.6210,
        "radius_m": 360
    },
    {
        "zone_id": "BLR-COL-013",
        "name": "Jyoti Nivas College (Autonomous)",
        "amenity": "college",
        "institution_type": "Autonomous Degree College",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 16:30 IST",
        "address": "Hosur Road, Koramangala 5th Block",
        "lat": 12.9338,
        "lon": 77.6182,
        "radius_m": 220
    },
    {
        "zone_id": "BLR-COL-014",
        "name": "National Law School of India University (NLSIU)",
        "amenity": "university",
        "institution_type": "Premier National Law University",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 19:00 IST",
        "address": "Gnana Bharathi Main Road, Nagarbhavi",
        "lat": 12.9554,
        "lon": 77.5085,
        "radius_m": 310
    },
    {
        "zone_id": "BLR-COL-015",
        "name": "IIIT Bangalore (Electronic City)",
        "amenity": "university",
        "institution_type": "Information Technology Institute",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:30 - 18:00 IST",
        "address": "26/C, Hosur Road, Electronic City Phase 1",
        "lat": 12.8407,
        "lon": 77.6653,
        "radius_m": 270
    },
    {
        "zone_id": "BLR-COL-016",
        "name": "Dayananda Sagar College of Engineering (DSCE)",
        "amenity": "college",
        "institution_type": "Engineering College & Innovation Campus",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 17:30 IST",
        "address": "Shavige Malleshwara Hills, Kumaraswamy Layout",
        "lat": 12.9081,
        "lon": 77.5667,
        "radius_m": 320
    },
    {
        "zone_id": "BLR-COL-017",
        "name": "University Visvesvaraya College of Engineering (UVCE)",
        "amenity": "college",
        "institution_type": "Historic State Engineering College",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:30 - 17:00 IST",
        "address": "KR Circle, Dr. Ambedkar Veedhi",
        "lat": 12.9754,
        "lon": 77.5866,
        "radius_m": 220
    },
    {
        "zone_id": "BLR-COL-018",
        "name": "New Horizon College of Engineering",
        "amenity": "college",
        "institution_type": "Autonomous Engineering College",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 17:30 IST",
        "address": "Outer Ring Road, Near Marathahalli",
        "lat": 12.9366,
        "lon": 77.6917,
        "radius_m": 280
    },
    {
        "zone_id": "BLR-COL-019",
        "name": "CMR Institute of Technology (CMRIT)",
        "amenity": "college",
        "institution_type": "Technical Institute",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 17:00 IST",
        "address": "132 AECS Layout, ITPL Main Road, Kundalahalli",
        "lat": 12.9667,
        "lon": 77.7126,
        "radius_m": 250
    },
    {
        "zone_id": "BLR-COL-020",
        "name": "The Oxford College of Engineering",
        "amenity": "college",
        "institution_type": "Engineering & Technology Campus",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 17:00 IST",
        "address": "10th Milestone, Hosur Road, Bommanahalli",
        "lat": 12.8988,
        "lon": 77.6225,
        "radius_m": 240
    },
    {
        "zone_id": "BLR-COL-021",
        "name": "Bangalore University (Jnana Bharathi Campus)",
        "amenity": "university",
        "institution_type": "State Public University",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 18:00 IST",
        "address": "Jnana Bharathi, Mysore Road",
        "lat": 12.9463,
        "lon": 77.5082,
        "radius_m": 500
    },
    {
        "zone_id": "BLR-COL-022",
        "name": "Presidency College (Hebbal)",
        "amenity": "college",
        "institution_type": "Management & Arts College",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 16:30 IST",
        "address": "33/2C, Kempapura, Hebbal",
        "lat": 13.0518,
        "lon": 77.5937,
        "radius_m": 220
    },
    {
        "zone_id": "BLR-COL-023",
        "name": "Jain University (City Campus)",
        "amenity": "university",
        "institution_type": "Deemed-to-be University",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 17:00 IST",
        "address": "District Fund Road, Jayanagar 9th Block",
        "lat": 12.9195,
        "lon": 77.5925,
        "radius_m": 210
    },
    {
        "zone_id": "BLR-COL-024",
        "name": "BMS Institute of Technology & Management (BMSIT)",
        "amenity": "college",
        "institution_type": "Engineering Institute",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 17:00 IST",
        "address": "Doddaballapur Main Road, Avalahalli, Yelahanka",
        "lat": 13.1332,
        "lon": 77.5678,
        "radius_m": 280
    },
    {
        "zone_id": "BLR-COL-025",
        "name": "Shri Atal Bihari Vajpayee Medical College",
        "amenity": "college",
        "institution_type": "Government Medical College",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "24/7 Clinical & Academic Zone",
        "address": "Lady Curzon Road, Shivaji Nagar",
        "lat": 12.9830,
        "lon": 77.6040,
        "radius_m": 240
    },
    {
        "zone_id": "BLR-COL-026",
        "name": "Dr. B.R. Ambedkar Medical College",
        "amenity": "college",
        "institution_type": "Medical College & Hospital",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "24/7 Medical Zone",
        "address": "Kadugondanahalli",
        "lat": 13.0185,
        "lon": 77.6215,
        "radius_m": 260
    },

    # --- SCHOOLS & ACADEMIES ---
    {
        "zone_id": "BLR-SCH-001",
        "name": "Bishop Cotton Boys' School",
        "amenity": "school",
        "institution_type": "Historic ICSE Heritage School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "07:30 - 15:30 IST",
        "address": "St. Mark's Road, Ashok Nagar",
        "lat": 12.9719,
        "lon": 77.6012,
        "radius_m": 210
    },
    {
        "zone_id": "BLR-SCH-002",
        "name": "Bishop Cotton Girls' School",
        "amenity": "school",
        "institution_type": "ICSE Girls Academy",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "07:30 - 15:30 IST",
        "address": "St. Mark's Road / Residency Road",
        "lat": 12.9691,
        "lon": 77.6033,
        "radius_m": 190
    },
    {
        "zone_id": "BLR-SCH-003",
        "name": "St. Joseph's Boys' High School",
        "amenity": "school",
        "institution_type": "ICSE Senior Secondary",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "07:45 - 15:45 IST",
        "address": "Museum Road, Shanthala Nagar",
        "lat": 12.9734,
        "lon": 77.6038,
        "radius_m": 180
    },
    {
        "zone_id": "BLR-SCH-004",
        "name": "National Public School (Indiranagar)",
        "amenity": "school",
        "institution_type": "CBSE Affiliated K-12",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 15:00 IST",
        "address": "12th A Main, HAL 2nd Stage, Indiranagar",
        "lat": 12.9698,
        "lon": 77.6433,
        "radius_m": 180
    },
    {
        "zone_id": "BLR-SCH-005",
        "name": "National Public School (Koramangala)",
        "amenity": "school",
        "institution_type": "CBSE Senior Secondary",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 15:00 IST",
        "address": "National Games Village, Koramangala",
        "lat": 12.9392,
        "lon": 77.6214,
        "radius_m": 180
    },
    {
        "zone_id": "BLR-SCH-006",
        "name": "National Public School (Rajajinagar)",
        "amenity": "school",
        "institution_type": "CBSE K-12 Academy",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 15:00 IST",
        "address": "5th Block, Rajajinagar",
        "lat": 12.9880,
        "lon": 77.5540,
        "radius_m": 180
    },
    {
        "zone_id": "BLR-SCH-007",
        "name": "Bethany High School (Koramangala)",
        "amenity": "school",
        "institution_type": "ICSE K-12 High School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "07:45 - 15:30 IST",
        "address": "8th Main, 4th Block, Koramangala",
        "lat": 12.9348,
        "lon": 77.6254,
        "radius_m": 190
    },
    {
        "zone_id": "BLR-SCH-008",
        "name": "Frank Anthony Public School",
        "amenity": "school",
        "institution_type": "Anglo-Indian Day School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 15:30 IST",
        "address": "Cambridge Road, Halasuru (Ulsoor)",
        "lat": 12.9732,
        "lon": 77.6245,
        "radius_m": 200
    },
    {
        "zone_id": "BLR-SCH-009",
        "name": "Army Public School (Kamaraj Road)",
        "amenity": "school",
        "institution_type": "AWES CBSE Senior Secondary",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "07:30 - 14:30 IST",
        "address": "Kamaraj Road, FM Cariappa Colony",
        "lat": 12.9792,
        "lon": 77.6148,
        "radius_m": 220
    },
    {
        "zone_id": "BLR-SCH-010",
        "name": "Baldwin Boys' High School",
        "amenity": "school",
        "institution_type": "Methodist ICSE Boarding & Day School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "07:45 - 15:30 IST",
        "address": "14 Hosur Road, Richmond Town",
        "lat": 12.9642,
        "lon": 77.6035,
        "radius_m": 190
    },
    {
        "zone_id": "BLR-SCH-011",
        "name": "Baldwin Girls' High School",
        "amenity": "school",
        "institution_type": "ICSE Girls High School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "07:45 - 15:30 IST",
        "address": "90 Rhenius Street, Richmond Town",
        "lat": 12.9631,
        "lon": 77.6008,
        "radius_m": 180
    },
    {
        "zone_id": "BLR-SCH-012",
        "name": "Sophia High School",
        "amenity": "school",
        "institution_type": "Catholic ICSE Girls School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 15:00 IST",
        "address": "70 Palace Road, High Grounds",
        "lat": 12.9885,
        "lon": 77.5878,
        "radius_m": 190
    },
    {
        "zone_id": "BLR-SCH-013",
        "name": "The Cathedral High School",
        "amenity": "school",
        "institution_type": "ICSE Co-Educational School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 15:15 IST",
        "address": "63 Richmond Road",
        "lat": 12.9664,
        "lon": 77.6080,
        "radius_m": 180
    },
    {
        "zone_id": "BLR-SCH-014",
        "name": "Clarence High School",
        "amenity": "school",
        "institution_type": "Minority ICSE School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 15:30 IST",
        "address": "Pottery Road, Richards Town",
        "lat": 13.0035,
        "lon": 77.6180,
        "radius_m": 190
    },
    {
        "zone_id": "BLR-SCH-015",
        "name": "St. Germain High School",
        "amenity": "school",
        "institution_type": "Anglo-Indian ICSE School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 15:30 IST",
        "address": "Promenade Road, Frazer Town",
        "lat": 12.9980,
        "lon": 77.6142,
        "radius_m": 200
    },
    {
        "zone_id": "BLR-SCH-016",
        "name": "The International School Bangalore (TISB)",
        "amenity": "school",
        "institution_type": "IB & IGCSE International Boarding School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 16:00 IST",
        "address": "NAFL Valley, Whitefield-Sarjapur Road",
        "lat": 12.8715,
        "lon": 77.7490,
        "radius_m": 350
    },
    {
        "zone_id": "BLR-SCH-017",
        "name": "Greenwood High International School",
        "amenity": "school",
        "institution_type": "IB, IGCSE & ICSE International School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 15:30 IST",
        "address": "Chikkawadayarapura, Near Varthur Sarjapur Road",
        "lat": 12.8942,
        "lon": 77.7420,
        "radius_m": 320
    },
    {
        "zone_id": "BLR-SCH-018",
        "name": "Inventure Academy",
        "amenity": "school",
        "institution_type": "Progressive International School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 15:30 IST",
        "address": "Whitefield-Sarjapur Road, Chikka Tirupathi",
        "lat": 12.8790,
        "lon": 77.7485,
        "radius_m": 300
    },
    {
        "zone_id": "BLR-SCH-019",
        "name": "Vidyashilp Academy",
        "amenity": "school",
        "institution_type": "Experiential ICSE Academy",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 15:30 IST",
        "address": "125 Off Yelahanka-Aero Road, Near RMZ Galleria",
        "lat": 13.1180,
        "lon": 77.5960,
        "radius_m": 280
    },
    {
        "zone_id": "BLR-SCH-020",
        "name": "Canadian International School (CIS)",
        "amenity": "school",
        "institution_type": "International Baccalaureate (IB) World School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:15 - 15:30 IST",
        "address": "4 and 20 Manchenahalli, Yelahanka",
        "lat": 13.1360,
        "lon": 77.5975,
        "radius_m": 290
    },
    {
        "zone_id": "BLR-SCH-021",
        "name": "Mallya Aditi International School",
        "amenity": "school",
        "institution_type": "Private Co-Educational International School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 15:00 IST",
        "address": "Yelahanka New Town",
        "lat": 13.1040,
        "lon": 77.5940,
        "radius_m": 240
    },
    {
        "zone_id": "BLR-SCH-022",
        "name": "Delhi Public School (Bangalore South)",
        "amenity": "school",
        "institution_type": "CBSE Senior Secondary School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 15:00 IST",
        "address": "11th KM, Bikashipura, Kanakapura Road",
        "lat": 12.8745,
        "lon": 77.5380,
        "radius_m": 280
    },
    {
        "zone_id": "BLR-SCH-023",
        "name": "Delhi Public School (Bangalore East)",
        "amenity": "school",
        "institution_type": "CBSE Senior Secondary School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "CRITICAL",
        "active_hours": "08:00 - 15:00 IST",
        "address": "Survey No 43/1B, Sulikunte Village, Dommasandra",
        "lat": 12.8830,
        "lon": 77.7310,
        "radius_m": 290
    },
    {
        "zone_id": "BLR-SCH-024",
        "name": "Presidency School (Bangalore South)",
        "amenity": "school",
        "institution_type": "CBSE Affiliated School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 15:30 IST",
        "address": "Bilekahalli, Off Bannerghatta Road",
        "lat": 12.8940,
        "lon": 77.6030,
        "radius_m": 200
    },
    {
        "zone_id": "BLR-SCH-025",
        "name": "The Brigade School (JP Nagar)",
        "amenity": "school",
        "institution_type": "ICSE School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 15:00 IST",
        "address": "Brigade Millennium Township, 7th Phase, JP Nagar",
        "lat": 12.8910,
        "lon": 77.5820,
        "radius_m": 210
    },
    {
        "zone_id": "BLR-SCH-026",
        "name": "Ekya School (JP Nagar)",
        "amenity": "school",
        "institution_type": "Concept-Driven ICSE School",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 15:00 IST",
        "address": "24th Main Road, JP Nagar 7th Phase",
        "lat": 12.8935,
        "lon": 77.5840,
        "radius_m": 190
    },
    {
        "zone_id": "BLR-SCH-027",
        "name": "Global Indian International School (GIIS)",
        "amenity": "school",
        "institution_type": "CBSE SMART Campus",
        "speed_limit_kmh": 25,
        "speed_limit_mph": 15,
        "risk_level": "HIGH",
        "active_hours": "08:00 - 15:30 IST",
        "address": "5th Cross, Gottigere, Bannerghatta Road",
        "lat": 12.8630,
        "lon": 77.5920,
        "radius_m": 220
    }
]

def make_polygon(center_lat, center_lon, radius_m):
    """
    Generate an organic 6-sided polygon around the center point.
    """
    # 1 deg lat ≈ 111,000 meters
    delta_lat = radius_m / 111000.0
    delta_lon = radius_m / (111000.0 * math.cos(math.radians(center_lat)))
    
    # Generate 6 points for a realistic campus perimeter
    coords = []
    angles = [0, 60, 120, 180, 240, 300]
    for idx, angle in enumerate(angles):
        rad = math.radians(angle)
        # Slight variation in radius to mimic real physical boundaries
        factor = 1.0 + 0.15 * math.sin(angle * 2.0)
        p_lat = center_lat + math.sin(rad) * delta_lat * factor
        p_lon = center_lon + math.cos(rad) * delta_lon * factor
        coords.append([round(p_lon, 6), round(p_lat, 6)])
    # Close polygon
    coords.append(coords[0])
    return coords

def build_geojson():
    features = []
    for item in INSTITUTIONS:
        poly = make_polygon(item["lat"], item["lon"], item["radius_m"])
        feature = {
            "type": "Feature",
            "id": f"zone-{item['zone_id'].lower()}",
            "properties": {
                "zone_id": item["zone_id"],
                "name": item["name"],
                "amenity": item["amenity"],
                "institution_type": item["institution_type"],
                "speed_limit_kmh": item["speed_limit_kmh"],
                "speed_limit_mph": item["speed_limit_mph"],
                "risk_level": item["risk_level"],
                "active_hours": item["active_hours"],
                "address": item["address"],
                "center": [item["lon"], item["lat"]],
                "city": "Bengaluru",
                "state": "Karnataka",
                "country": "India"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [poly]
            }
        }
        features.append(feature)

    data = {
        "type": "FeatureCollection",
        "metadata": {
            "city": "Bengaluru",
            "region": "Karnataka, India",
            "source": "OpenStreetMap & Department of Collegiate & School Education, Bengaluru",
            "total_zones": len(features),
            "colleges_count": len([i for i in INSTITUTIONS if i["amenity"] in ["college", "university"]]),
            "schools_count": len([i for i in INSTITUTIONS if i["amenity"] == "school"]),
            "generated_at": "2026-11-19"
        },
        "features": features
    }
    return data

if __name__ == "__main__":
    geojson = build_geojson()
    backend_file = os.path.join(os.path.dirname(__file__), "..", "data", "bengaluru_schools.geojson")
    frontend_file = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "data", "bengaluru_schools.geojson")
    
    with open(backend_file, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2)
    print(f"Wrote {len(geojson['features'])} zones to {backend_file}")
    
    os.makedirs(os.path.dirname(frontend_file), exist_ok=True)
    with open(frontend_file, "w", encoding="utf-8") as f:
        json.dump(geojson, f, indent=2)
    print(f"Wrote {len(geojson['features'])} zones to {frontend_file}")
