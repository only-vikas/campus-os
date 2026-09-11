import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

// Regex to extract student rows (Roll, USN, Name)
const studentRegex = /\|\s*\d+\s*\|\s*([A-Z0-9]+)\s*\|\s*([^|]+?)\s*\|/g;
// Regex to extract placement rows (USN, Name, Year, Company, Salary)
const placementRegex = /^([A-Z0-9]+)\s+([A-Za-z\s.]+?)\s+(202[0-4])\s+(.+?)\s+([\d.A-Z\s|]+|NA)$/gm;

async function seedData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in env');
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('campus_os');
    console.log('Connected to MongoDB');

    const rawDataPath = path.join(process.cwd(), 'scripts', 'raw-data.txt');
    const content = fs.readFileSync(rawDataPath, 'utf-8');

    // 1. Parse Students
    const students = new Map();
    let match;
    while ((match = studentRegex.exec(content)) !== null) {
      const usn = match[1].trim();
      const name = match[2].trim();
      if (!students.has(usn)) {
        students.set(usn, { usn, name });
      }
    }
    console.log(`Parsed ${students.size} students from roll calls.`);

    // 2. Parse Placements
    const placements = [];
    while ((match = placementRegex.exec(content)) !== null) {
      const usn = match[1].trim();
      const name = match[2].trim();
      const year = parseInt(match[3]);
      const company = match[4].trim();
      const salary = match[5].trim();
      
      placements.push({ usn, name, year, company, salary });
      
      // If student is in placement list but wasn't in roll call, add them to students map
      if (usn !== 'NOT FOUND' && !students.has(usn)) {
         students.set(usn, { usn, name });
      }
    }
    console.log(`Parsed ${placements.length} placement records.`);

    // 3. Upsert Students into campus_os
    const studentCollection = db.collection('students');
    let studentInsertedCount = 0;
    for (const [usn, data] of Array.from(students.entries())) {
      const exists = await studentCollection.findOne({ usn });
      if (!exists) {
        await studentCollection.insertOne({
          usn,
          name: data.name,
          email: `${usn.toLowerCase()}@bec.edu.in`,
          department: 'Information Science and Engineering',
          semester: 8,
          cgpa: (Math.random() * (9.5 - 6.5) + 6.5).toFixed(2), // Mock CGPA for realism
          createdAt: new Date(),
        });
        studentInsertedCount++;
      }
    }
    console.log(`Inserted ${studentInsertedCount} new students into DB.`);

    // 4. Create Jobs & Applications from Placement Data
    const jobsCollection = db.collection('placement_jobs');
    const appsCollection = db.collection('placement_applications');
    
    // Group placements by company
    const companies = new Set();
    placements.forEach(p => {
      // Split by '|' because some rows have "Wipro | Infosys"
      p.company.split('|').forEach(c => companies.add(c.trim()));
    });

    // Create a job for each unique company
    const jobIds = new Map();
    for (const company of Array.from(companies)) {
      let job = await jobsCollection.findOne({ company });
      if (!job) {
        const result = await jobsCollection.insertOne({
          company,
          role: 'Software Engineer',
          package: '4.5',
          location: 'Bangalore',
          type: 'Full Time',
          minCGPA: 6.5,
          skills: ['Java', 'C++', 'Python', 'SQL'],
          deadline: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          logo: `https://logo.clearbit.com/${(company as string).toLowerCase().replace(/\s/g, '')}.com`,
          slots: Math.floor(Math.random() * 10) + 1,
          applied: 0,
          description: `Join ${company as string} as a Software Engineer.`
        });
        jobIds.set(company, result.insertedId.toString());
      } else {
        jobIds.set(company, job._id.toString());
      }
    }
    console.log(`Ensured ${companies.size} jobs exist in DB.`);

    // Create applications for the placements
    let appCount = 0;
    for (const placement of placements) {
      if (placement.usn === 'NOT FOUND') continue;

      const compList = placement.company.split('|').map(c => c.trim());
      for (const comp of compList) {
        const jobId = jobIds.get(comp);
        if (jobId) {
           const existingApp = await appsCollection.findOne({ usn: placement.usn, jobId });
           if (!existingApp) {
             await appsCollection.insertOne({
                usn: placement.usn,
                studentName: placement.name,
                jobId,
                company: comp,
                role: 'Software Engineer',
                status: 'Selected', // Because they are in the placement data!
                appliedDate: new Date().toISOString(),
                matchScore: Math.floor(Math.random() * (99 - 75) + 75)
             });
             // Increment job applied count
             await jobsCollection.updateOne({ _id: new ObjectId(jobId) }, { $inc: { applied: 1 } });
             appCount++;
           }
        }
      }
    }
    
    console.log(`Inserted ${appCount} historical successful applications.`);
    console.log('✅ Real student data successfully ingested!');
  } catch (err) {
    console.error('Error during data ingestion:', err);
  } finally {
    await client.close();
  }
}

seedData();
