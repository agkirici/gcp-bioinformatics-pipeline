"""
Local testing script for FASTQ QC analysis

This script simulates the Cloud Function locally without requiring GCP access.
It can read FASTQ files from disk and print QC metrics to console.
"""

import os
import sys
import gzip
from datetime import datetime
from pathlib import Path

# Add parent directory to path to import cloud function modules
sys.path.insert(0, str(Path(__file__).parent.parent / "cloud_function"))

try:
    from main import parse_fastq, calculate_qc_metrics
except ImportError:
    # Fallback: define functions locally if import fails
    def parse_fastq(file_content):
        """Parse FASTQ file content."""
        lines = file_content.decode('utf-8').strip().split('\n')
        sequences = []
        quality_strings = []
        
        i = 0
        while i < len(lines):
            if lines[i].startswith('@'):
                if i + 3 < len(lines):
                    sequences.append(lines[i + 1])
                    quality_strings.append(lines[i + 3])
                i += 4
            else:
                i += 1
        
        return sequences, quality_strings
    
    def calculate_qc_metrics(sequences, quality_strings):
        """Calculate QC metrics."""
        if not sequences:
            return {
                'total_reads': 0,
                'avg_length': 0.0,
                'gc_content': 0.0,
                'avg_quality': 0.0
            }
        
        total_reads = len(sequences)
        total_length = sum(len(seq) for seq in sequences)
        avg_length = total_length / total_reads if total_reads > 0 else 0.0
        
        total_bases = 0
        gc_bases = 0
        for seq in sequences:
            seq_upper = seq.upper()
            total_bases += len(seq_upper)
            gc_bases += seq_upper.count('G') + seq_upper.count('C')
        
        gc_content = (gc_bases / total_bases * 100) if total_bases > 0 else 0.0
        
        total_quality = 0
        quality_count = 0
        for qual_str in quality_strings:
            for char in qual_str:
                phred_score = ord(char) - 33
                total_quality += phred_score
                quality_count += 1
        
        avg_quality = total_quality / quality_count if quality_count > 0 else 0.0
        
        return {
            'total_reads': total_reads,
            'avg_length': round(avg_length, 2),
            'gc_content': round(gc_content, 2),
            'avg_quality': round(avg_quality, 2)
        }


def generate_sample_fastq(output_path, num_reads=100, read_length=100):
    """
    Generate a sample FASTQ file for testing.
    
    Args:
        output_path: Path to output file
        num_reads: Number of reads to generate
        read_length: Length of each read
    """
    bases = ['A', 'T', 'G', 'C']
    quality_chars = [chr(33 + i) for i in range(40)]  # Phred scores 0-39
    
    with open(output_path, 'w') as f:
        for i in range(num_reads):
            # Generate random sequence
            import random
            sequence = ''.join(random.choices(bases, k=read_length))
            quality = ''.join(random.choices(quality_chars, k=read_length))
            
            f.write(f"@read_{i}\n")
            f.write(f"{sequence}\n")
            f.write(f"+\n")
            f.write(f"{quality}\n")
    
    print(f"Generated sample FASTQ file: {output_path}")
    print(f"  Reads: {num_reads}, Length: {read_length} bp")


def process_fastq_file(file_path):
    """
    Process a FASTQ file and display QC metrics.
    
    Args:
        file_path: Path to FASTQ file (can be .fastq or .fastq.gz)
    """
    print(f"\n{'='*60}")
    print(f"Processing FASTQ file: {file_path}")
    print(f"{'='*60}\n")
    
    # Read file
    if file_path.endswith('.gz'):
        with gzip.open(file_path, 'rb') as f:
            file_content = f.read()
    else:
        with open(file_path, 'rb') as f:
            file_content = f.read()
    
    # Parse FASTQ
    print("Parsing FASTQ file...")
    sequences, quality_strings = parse_fastq(file_content)
    
    if not sequences:
        print("ERROR: No sequences found in file!")
        return
    
    print(f"Found {len(sequences)} reads")
    
    # Calculate metrics
    print("Calculating QC metrics...")
    metrics = calculate_qc_metrics(sequences, quality_strings)
    
    # Display results
    print(f"\n{'='*60}")
    print("QUALITY CONTROL METRICS")
    print(f"{'='*60}")
    print(f"Filename:        {os.path.basename(file_path)}")
    print(f"Total Reads:     {metrics['total_reads']:,}")
    print(f"Avg Length:      {metrics['avg_length']:.2f} bp")
    print(f"GC Content:      {metrics['gc_content']:.2f}%")
    print(f"Avg Quality:     {metrics['avg_quality']:.2f} (Phred)")
    print(f"{'='*60}\n")
    
    # Quality assessment
    print("QUALITY ASSESSMENT:")
    if metrics['avg_quality'] >= 30:
        print("  ✓ Excellent quality (Phred >= 30)")
    elif metrics['avg_quality'] >= 20:
        print("  ⚠ Good quality (Phred >= 20)")
    else:
        print("  ✗ Poor quality (Phred < 20)")
    
    if 40 <= metrics['gc_content'] <= 60:
        print("  ✓ GC content in normal range (40-60%)")
    else:
        print(f"  ⚠ GC content outside normal range: {metrics['gc_content']:.2f}%")
    
    print()


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Test FASTQ QC analysis locally'
    )
    parser.add_argument(
        'file',
        nargs='?',
        help='Path to FASTQ file to analyze'
    )
    parser.add_argument(
        '--generate',
        action='store_true',
        help='Generate a sample FASTQ file for testing'
    )
    parser.add_argument(
        '--output',
        default='sample.fastq',
        help='Output path for generated FASTQ file (default: sample.fastq)'
    )
    parser.add_argument(
        '--reads',
        type=int,
        default=100,
        help='Number of reads for generated file (default: 100)'
    )
    parser.add_argument(
        '--length',
        type=int,
        default=100,
        help='Read length for generated file (default: 100)'
    )
    
    args = parser.parse_args()
    
    if args.generate:
        generate_sample_fastq(args.output, args.reads, args.length)
        print(f"\nYou can now test with: python test_local.py {args.output}")
    elif args.file:
        if not os.path.exists(args.file):
            print(f"ERROR: File not found: {args.file}")
            sys.exit(1)
        process_fastq_file(args.file)
    else:
        parser.print_help()
        print("\nExample usage:")
        print("  python test_local.py --generate")
        print("  python test_local.py sample.fastq")


if __name__ == '__main__':
    main()

