"""
Traffic Infringement Data Processor

This script processes traffic infringement data from CSV files and converts
it to GeoJSON format for visualization in the heatmap application.
"""

import pandas as pd
import numpy as np
import json
import os
import shutil
from pathlib import Path
import argparse


def normalize_values(series):
    """Normalize values to a 0-100 scale for intensity"""
    min_val = series.min()
    max_val = series.max()
    return 100 * (series - min_val) / (max_val - min_val)


def load_geocoding_data():
    """Load location to coordinate mappings"""
    # This is a simplified approach - for a real project you would use a geocoding service
    # Example mapping of Queensland regions to coordinates
    return {
        'BRISBANE': {'lat': -27.4698, 'lon': 153.0251},
        'GOLD COAST': {'lat': -28.0167, 'lon': 153.4000},
        'SUNSHINE COAST': {'lat': -26.6500, 'lon': 153.0667},
        'LOGAN': {'lat': -27.6392, 'lon': 153.1086},
        'IPSWICH': {'lat': -27.6161, 'lon': 152.7610},
        'CAIRNS': {'lat': -16.9186, 'lon': 145.7781},
        'TOWNSVILLE': {'lat': -19.2590, 'lon': 146.8169},
        'TOOWOOMBA': {'lat': -27.5598, 'lon': 151.9507},
        'MACKAY': {'lat': -21.1412, 'lon': 149.1868},
        'ROCKHAMPTON': {'lat': -23.3791, 'lon': 150.5100},
        'BUNDABERG': {'lat': -24.8500, 'lon': 152.3500},
        'HERVEY BAY': {'lat': -25.2882, 'lon': 152.8730},
        'GLADSTONE': {'lat': -23.8430, 'lon': 151.2583},
        'MARYBOROUGH': {'lat': -25.5378, 'lon': 152.7020},
        'MOUNT ISA': {'lat': -20.7256, 'lon': 139.4927},
        # Add more regions as needed
    }


def process_infringement_data(input_file, output_dir, copy_to_client=True):
    """Process infringement data from CSV and convert to GeoJSON"""
    print(f"Processing {input_file}...")

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Load the data
    df = pd.read_csv(input_file, header=0)
    print(f"Loaded {len(df)} records")

    # Clean column names
    df.columns = [col.strip().lower().replace(' ', '_') for col in df.columns]

    # Load geocoding data
    geo_mapping = load_geocoding_data()

    # Function to add coordinates
    def add_coordinates(row):
        location = row['district']
        if location in geo_mapping:
            return pd.Series([geo_mapping[location]['lat'], geo_mapping[location]['lon']])
        else:
            return pd.Series([None, None])

    # Apply geocoding
    df[['latitude', 'longitude']] = df.apply(add_coordinates, axis=1)
    print(f"Geocoded {df['latitude'].notna().sum()} out of {len(df)} records")

    # Group by location and sum counts
    location_counts = df.groupby(['district', 'latitude', 'longitude'])['count'].sum().reset_index()
    location_counts = location_counts.sort_values('count', ascending=False)

    # Normalize counts to intensity
    location_counts['intensity'] = normalize_values(location_counts['count'])

    # Remove rows with missing coordinates
    geo_data = location_counts.dropna(subset=['latitude', 'longitude'])

    # Create GeoJSON
    features = []
    for _, row in geo_data.iterrows():
        feature = {
            "type": "Feature",
            "properties": {
                "intensity": float(row['intensity']),
                "location": row['district'],
                "count": int(row['count'])
            },
            "geometry": {
                "type": "Point",
                "coordinates": [float(row['longitude']), float(row['latitude'])]
            }
        }
        features.append(feature)

    geojson_data = {
        "type": "FeatureCollection",
        "features": features
    }

    # Save the GeoJSON data
    geojson_file = os.path.join(output_dir, 'infringements.json')
    with open(geojson_file, 'w') as f:
        json.dump(geojson_data, f, indent=2)

    # Save CSV version
    csv_file = os.path.join(output_dir, 'infringements.csv')
    geo_data[['latitude', 'longitude', 'intensity']].to_csv(csv_file, index=False)

    print(f"GeoJSON saved to {geojson_file}")
    print(f"CSV saved to {csv_file}")

    # Copy to client directory if requested
    if copy_to_client:
        root_dir = Path(__file__).resolve().parents[2]
        client_data_dir = root_dir / 'client' / 'data'
        os.makedirs(client_data_dir, exist_ok=True)

        # Copy files
        shutil.copy(geojson_file, client_data_dir / 'data.json')
        shutil.copy(csv_file, client_data_dir / 'data.csv')
        print(f"Files copied to web app directory: {client_data_dir}")

    return geojson_file, csv_file


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Process traffic infringement data')
    parser.add_argument('--input', '-i', default='../../data/trafficinfringementsissued.csv',
                        help='Input CSV file path')
    parser.add_argument('--output', '-o', default='../output',
                        help='Output directory for processed files')
    parser.add_argument('--no-copy', action='store_false', dest='copy_to_client',
                        help='Do not copy output to client/data directory')

    args = parser.parse_args()
    process_infringement_data(args.input, args.output, args.copy_to_client)