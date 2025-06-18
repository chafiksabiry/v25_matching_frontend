import Match from '../models/Match.js';
import Rep from '../models/Rep.js';
import Gig from '../models/Gig.js';
import { StatusCodes } from 'http-status-codes';
import { calculateMatchScore, findMatchesForGig, findGigsForRep, optimizeMatches } from '../utils/matchingAlgorithm.js';

// Get all matches
export const getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('repId')
      .populate('gigId');
    res.status(StatusCodes.OK).json(matches);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Get a single match
export const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('repId')
      .populate('gigId');
    if (!match) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Match not found' });
    }
    res.status(StatusCodes.OK).json(match);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Create a new match
export const createMatch = async (req, res) => {
  try {
    const match = new Match(req.body);
    const savedMatch = await match.save();
    res.status(StatusCodes.CREATED).json(savedMatch);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

// Update a match
export const updateMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!match) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Match not found' });
    }
    res.status(StatusCodes.OK).json(match);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

// Delete a match
export const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Match not found' });
    }
    res.status(StatusCodes.OK).json({ message: 'Match deleted successfully' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Find matches for a specific gig
export const findMatchesForGigById = async (req, res) => {
  try {
    const { id } = req.params;
    const { weights, limit = 10 } = req.body;
    
    const gig = await Gig.findById(id);
    if (!gig) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Gig not found' });
    }
    
    const reps = await Rep.find();
    const matches = findMatchesForGig(gig, reps, weights, limit);
    
    res.status(StatusCodes.OK).json(matches);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Find gigs for a specific rep
export const findGigsForRepById = async (req, res) => {
  try {
    const { id } = req.params;
    const { weights, limit = 10 } = req.body;
    
    const rep = await Rep.findById(id);
    if (!rep) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Rep not found' });
    }
    
    const gigs = await Gig.find();
    const matches = findGigsForRep(rep, gigs, weights, limit);
    
    res.status(StatusCodes.OK).json(matches);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Generate optimal matches
export const generateOptimalMatches = async (req, res) => {
  try {
    const { weights } = req.body;
    
    const reps = await Rep.find();
    const gigs = await Gig.find();
    
    const optimalMatches = optimizeMatches(reps, gigs, weights);
    
    res.status(StatusCodes.OK).json(optimalMatches);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Calculate match score between a specific rep and gig
export const calculateMatchScoreForRepAndGig = async (req, res) => {
  try {
    const { repId, gigId } = req.params;
    const { weights } = req.body;
    
    const rep = await Rep.findById(repId);
    if (!rep) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Rep not found' });
    }
    
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Gig not found' });
    }
    
    const score = calculateMatchScore(rep, gig, weights);
    
    res.status(StatusCodes.OK).json({ 
      repId, 
      gigId, 
      score,
      rep: rep.name || rep.username,
      gig: gig.title
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};